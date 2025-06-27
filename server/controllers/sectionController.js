const Section = require('../models/Section');

exports.getSections = async (req, res) => {
  try {
    const sections = await Section.find({ userId: req.user.id });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createSection = async (req, res) => {
  try {
    const newSection = new Section({ ...req.body, userId: req.user.id });
    await newSection.save();
    res.status(201).json(newSection);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(section);
  } catch (err) {
    res.status(404).json({ error: 'Section not found' });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Section not found' });
  }
};