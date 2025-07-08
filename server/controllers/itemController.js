/*
 * This file handles the item-related operations (CRUD)
 */

const Section = require("../models/Section");
const Item = require("../models/Item");
const itemEvents = require("../events/itemEvents");

exports.getItems = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId).populate(
      "items"
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

    const newItem = new Item(req.body);
    await newItem.save();

    section.items.push(newItem._id);
    await section.save();

    itemEvents.emitItemCreated(req.params.username, newItem);

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const oldSectionId = item.sectionId.toString();
    const newSectionId = req.body.sectionId;

    item.sectionId = newSectionId;
    await item.save();

    // remove from old section's items array
    if (oldSectionId !== newSectionId) {
      await Section.findByIdAndUpdate(oldSectionId, {
        $pull: { items: item._id },
      });
      // add to new section's items array
      await Section.findByIdAndUpdate(newSectionId, {
        $addToSet: { items: item._id },
      });
    }

    itemEvents.emitItemUpdated(req.params.username, item);

    res.json(item);
  } catch (err) {
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
    );
    if (!section) return res.status(404).json({ error: "Section not found" });
    itemEvents.emitItemOrderUpdated(req.params.username, section._id.toString(), order);
    res.json({ success: true });
  } catch (err) {
    console.error("updateItemOrder error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.moveItem = async (req, res) => {
  try {
    const { toSectionId, toIndex } = req.body;
    const { sectionId, itemId } = req.params;

    if (!toSectionId) {
      return res.status(400).json({ error: "Missing toSectionId" });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const fromSection = await Section.findById(sectionId);
    if (!fromSection) return res.status(404).json({ error: "Source section not found" });
    fromSection.items.pull(item._id);
    await fromSection.save();

    const toSection = await Section.findById(toSectionId);
    if (!toSection) return res.status(404).json({ error: "Destination section not found" });

    if (typeof toIndex === "number" && toIndex >= 0 && toIndex <= toSection.items.length) {
      toSection.items.splice(toIndex, 0, item._id);
    } else {
      toSection.items.push(item._id);
    }
    await toSection.save();

    item.sectionId = toSectionId;
    await item.save();

    itemEvents.emitItemUpdated(req.params.username, item);

    res.json({ success: true, item });
  } catch (err) {
    console.error("moveItem error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
    

exports.deleteItem = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    if (!section) return res.status(404).json({ error: "Section not found" });

    await Item.findByIdAndDelete(req.params.itemId);
    section.items.pull(req.params.itemId);
    await section.save();

    itemEvents.emitItemDeleted(req.params.username, req.params.itemId);

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};
