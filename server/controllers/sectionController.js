/*
 * This file handles the section-related operations (CRUD)
 */

const Section = require("../models/Section");
const User = require("../models/User");

exports.getSectionsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const sections = await Section.find({ userId: user.auth0Id }).populate(
      "items"
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
    const { order } = req.body; // order should be an array of section IDs
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { sectionOrder: order },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createSection = async (req, res) => {
  try {
    const newSection = new Section({ ...req.body, userId: req.auth.sub });
    await newSection.save();
    await User.findOneAndUpdate(
      { auth0Id: req.auth.sub },
      { $push: { sections: newSection._id } }
    );
    res.status(201).json(newSection);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!section) return res.status(404).json({ error: "Section not found" });
    res.json(section);
  } catch (err) {
    res.status(404).json({ error: "Section not found" });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found" });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Section not found" });
  }
};
