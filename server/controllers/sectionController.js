/*
 * This file handles the section-related operations (CRUD)
 */

const { updateGraph } = require("../utils/graphCache");

const Section = require("../models/Section");
const Item = require("../models/Item");
const User = require("../models/User");
const sectionEvents = require("../events/sectionEvents");
const { ITEMS_FIELD } = require("../utils/constants");
const { getEmbedding } = require("../utils/embedder");
const { addJob } = require("../utils/jobQueue");

exports.getSectionsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const sections = await Section.find({ userId: user.auth0Id }).populate(
      ITEMS_FIELD
    );

    let orderedSections = sections;
    if (user.sectionOrder && user.sectionOrder.length) {
      const sectionMap = {};
      sections.forEach((section) => {
        sectionMap[section._id.toString()] = section;
      });
      orderedSections = [
        ...user.sectionOrder
          .map((id) => sectionMap[id.toString()])
          .filter(Boolean),
        ...sections.filter(
          (s) =>
            !user.sectionOrder
              .map((id) => id.toString())
              .includes(s._id.toString())
        ),
      ];
    }

    res.json(orderedSections);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateSectionOrder = async (req, res) => {
  try {
    const { order, movedId } = req.body; // order is an array of section IDs
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { sectionOrder: order },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    let movedTitle = "";
    if (movedId) {
      const movedSection = await Section.findById(movedId);
      movedTitle = movedSection ? movedSection.title : "";
    }

    sectionEvents.emitSectionOrderUpdated(
      req.params.username,
      order,
      req.body.username,
      movedTitle
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createSection = async (req, res) => {
  try {
    const pageOwner = await User.findOne({ username: req.params.username });
    if (!pageOwner) return res.status(404).json({ error: "User not found" });

    const newSection = new Section({
      ...req.body,
      userId: pageOwner.auth0Id,
      embedding: [],
    });
    await newSection.save();
    await User.findOneAndUpdate(
      { auth0Id: pageOwner.auth0Id },
      { $push: { sections: newSection._id } }
    );

    // add embedding to job queue
    addJob(async () => {
      const embedding = await getEmbedding(newSection.title);
      if (embedding) {
        await Section.findByIdAndUpdate(newSection._id, { embedding });
      }
    });

    // push to other users
    sectionEvents.emitSectionCreated(req.params.username, {
      ...newSection.toObject(),
      username: req.body.username,
    });

    res.status(201).json(newSection);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found" });

    // Check timestamp for conflict resolution
    const clientTimestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    const serverTimestamp = section.lastModified || section.updatedAt || new Date(0);

    if (clientTimestamp < serverTimestamp) {
      return res.status(409).json({ 
        error: "Conflict: Section was modified more recently by another user",
        serverSection: section,
        serverTimestamp: serverTimestamp
      });
    }

    let embedding;
    if (req.body.title) {
      embedding = await getEmbedding(req.body.title);
    }

    const updateData = { 
      ...req.body,
      lastModified: clientTimestamp
    };
    if (embedding) updateData.embedding = embedding;

    const updatedSection = await Section.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    sectionEvents.emitSectionUpdated(req.params.username, {
      ...updatedSection.toObject(),
      username: req.body.username,
    });

    res.json(updatedSection);
  } catch (err) {
    res.status(404).json({ error: "Section not found" });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found" });

    // Check timestamp for conflict resolution
    const clientTimestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    const serverTimestamp = section.lastModified || section.updatedAt || new Date(0);

    if (clientTimestamp < serverTimestamp) {
      return res.status(409).json({ 
        error: "Conflict: Section was modified more recently",
        serverSection: section,
        serverTimestamp: serverTimestamp
      });
    }

    const roomId = req.params.username;

    if (section.items && section.items.length > 0) {
      section.items.forEach(item => {
        updateGraph(roomId, { _id: item._id || item.id }, 'remove');
      });
    }

    await Item.deleteMany({ _id: { $in: section.items } });

    await User.findOneAndUpdate(
      { auth0Id: section.userId },
      { $pull: { sections: section._id } }
    );

    await Section.findByIdAndDelete(req.params.id);

    sectionEvents.emitSectionDeleted(
      req.params.username,
      req.params.id,
      req.body.username,
      section.title
    );

    res.status(204).send();
  } catch (err) {
    console.error("Delete section error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
