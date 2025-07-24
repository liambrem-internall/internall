/*
 * This file handles the item-related operations (CRUD)
 */

const Section = require("../models/Section");
const Item = require("../models/Item");
const itemEvents = require("../events/itemEvents");
const { ITEMS_FIELD } = require("../utils/constants");
const { getEmbedding } = require("../utils/embedder");
const { addJob } = require("../utils/jobQueue");
const { updateGraph } = require("../utils/graphCache");

exports.getItems = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId).populate(
      ITEMS_FIELD
    );
    if (!section) return res.status(404).json({ error: "Section not found" });
    res.json(section.items);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createItem = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    if (!section) return res.status(404).json({ error: "Section not found" });

    const newItem = new Item({
      ...req.body,
      sectionId: req.params.sectionId,
      embedding: [],
    });
    await newItem.save();

    section.items.push(newItem._id);
    await section.save();

    const roomId = req.params.username;

    addJob(async () => {
      const embedding = await getEmbedding(newItem.content);
      if (embedding) {
        await Item.findByIdAndUpdate(newItem._id, { embedding });
        const updatedItem = await Item.findById(newItem._id);
        updateGraph(roomId, updatedItem, "update");
      }
    });

    updateGraph(roomId, newItem, "add");

    itemEvents.emitItemCreated(req.params.username, {
      ...newItem.toObject(),
      username: req.body.username,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Create item error:", err);
    res.status(400).json({ error: "Invalid data" });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // check timestamp for conflict resolution
    const clientTimestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    const serverTimestamp = item.lastModified || item.updatedAt || new Date(0);
    const isOfflineEdit = req.body.isOfflineEdit === true;
    const isRoomOwner = req.body.username === req.params.username; // room owner check

    // room owner has admin privileges - their changes always take precedence
    // only check for conflicts if this isn't an offline edit being synced AND user is not room owner
    if (!isOfflineEdit && !isRoomOwner && clientTimestamp < serverTimestamp) {
      return res.status(409).json({ 
        error: "Conflict: Item was modified more recently by another user",
        serverItem: item,
        serverTimestamp: serverTimestamp
      });
    }

    const oldSectionId = item.sectionId.toString();
    const newSectionId = req.body.sectionId;
    const roomId = req.params.username;

    const contentChanged =
      req.body.content && req.body.content !== item.content;

    item.content = req.body.content ?? item.content;
    item.link = req.body.link ?? item.link;
    item.notes = req.body.notes ?? item.notes;
    item.sectionId = newSectionId ?? item.sectionId;
    item.lastModified = clientTimestamp;

    await item.save();

    if (contentChanged) {
      addJob(async () => {
        const embedding = await getEmbedding(item.content);
        if (embedding) {
          await Item.findByIdAndUpdate(item._id, { embedding });
          const updatedItem = await Item.findById(item._id);
          updateGraph(roomId, updatedItem, 'update');
        }
      });
    }

    const updatedItem = await Item.findById(item._id);
    updateGraph(roomId, updatedItem, 'update');

    if (oldSectionId !== newSectionId) {
      await Section.findByIdAndUpdate(oldSectionId, {
        $pull: { items: item._id },
      });
      await Section.findByIdAndUpdate(newSectionId, {
        $addToSet: { items: item._id },
      });
    }

    itemEvents.emitItemUpdated(req.params.username, {
      ...updatedItem.toObject(),
      username: req.body.username,
    });

    res.json(updatedItem);
  } catch (err) {
    console.error("Update item error:", err);
    res.status(400).json({ error: "Invalid data" });
  }
};

exports.updateItemOrder = async (req, res) => {
  try {
    const { order } = req.body; // array of item IDs
    const section = await Section.findByIdAndUpdate(
      req.params.sectionId,
      { items: order },
      { new: true }
    )
      .populate("items");
    if (!section) return res.status(404).json({ error: "Section not found" });
    let content = "";
    if (section.items.length > 0) {
      const firstItem = section.items.find(
        (i) => i._id.toString() === order[0]
      );
      content = firstItem?.content || "";
    }
    itemEvents.emitItemOrderUpdated(
      req.params.username,
      section._id.toString(),
      order,
      req.body.username,
      content
    );
    res.json({ success: true });
  } catch (err) {
    console.error("updateItemOrder error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.moveItem = async (req, res) => {
  try {
    const { toSectionId, toIndex, timestamp } = req.body;
    const { sectionId, itemId } = req.params;

    if (!toSectionId) {
      return res.status(400).json({ error: "Missing toSectionId" });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // check timestamp for conflict resolution
    const clientTimestamp = timestamp ? new Date(timestamp) : new Date();
    const serverTimestamp = item.lastModified || item.updatedAt || new Date(0);

    if (clientTimestamp < serverTimestamp) {
      return res.status(409).json({ 
        error: "Conflict: Item was moved more recently by another user",
        serverItem: item,
        serverTimestamp: serverTimestamp
      });
    }

    const fromSection = await Section.findById(sectionId);
    if (!fromSection)
      return res.status(404).json({ error: "Source section not found" });
    fromSection.items.pull(item._id);
    await fromSection.save();

    const toSection = await Section.findById(toSectionId);
    if (!toSection)
      return res.status(404).json({ error: "Destination section not found" });

    if (
      typeof toIndex === "number" &&
      toIndex >= 0 &&
      toIndex <= toSection.items.length
    ) {
      toSection.items.splice(toIndex, 0, item._id);
    } else {
      toSection.items.push(item._id);
    }
    await toSection.save();

    item.sectionId = toSectionId;
    item.lastModified = clientTimestamp;
    await item.save();

    itemEvents.emitItemUpdated(req.params.username, {
      ...item.toObject(),
      username: req.body.username,
    });

    res.json({ success: true, item });
  } catch (err) {
    console.error("moveItem error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      // if item not found, consider it as nonexistent
      return res.status(204).send();
    }

    // check timestamp for conflict resolution
    const clientTimestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    const serverTimestamp = item.lastModified || item.updatedAt || new Date(0);

    if (clientTimestamp < serverTimestamp) {
      return res.status(409).json({ 
        error: "Conflict: Item was modified more recently",
        serverItem: item,
        serverTimestamp: serverTimestamp
      });
    }

    // find the section that currently contains this item
    const section = await Section.findOne({ items: req.params.itemId });
    if (!section) {
      await Item.findByIdAndDelete(req.params.itemId);
      return res.status(204).send();
    }

    const roomId = req.params.username;

    updateGraph(roomId, { _id: item._id }, 'remove');

    await Item.findByIdAndDelete(req.params.itemId);
    section.items.pull(req.params.itemId);
    await section.save();

    itemEvents.emitItemDeleted(
      req.params.username,
      req.params.itemId,
      req.body.username,
      item.content
    );

    res.status(204).send();
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.findItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });
    
    const section = await Section.findOne({ items: req.params.itemId });
    
    res.json({
      ...item.toObject(),
      currentSectionId: section ? section._id : item.sectionId // fallback to item's sectionId if not found in any section
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};