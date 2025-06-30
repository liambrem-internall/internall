const Section = require("../models/Section");

exports.getSections = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const sections = await Section.find({ userId: user.auth0Id });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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