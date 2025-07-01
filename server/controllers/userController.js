/*
* This file handles the user-related operations (CRUD)
*/

const User = require('../models/User');
const Section = require('../models/Section');

exports.getCurrentUser = async (req, res) => {
  try {
    let user = await User.findOne({ auth0Id: req.auth.sub });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSectionsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const sections = await Section.find({ userId: user.auth0Id }).populate('items');

    let orderedSections = sections;
    if (user.sectionOrder && user.sectionOrder.length) {
      const sectionMap = {};
      sections.forEach(section => {
        sectionMap[section._id.toString()] = section;
      });
      orderedSections = [
        ...user.sectionOrder
          .map(id => sectionMap[id.toString()])
          .filter(Boolean),
        ...sections.filter(
          s => !user.sectionOrder.map(id => id.toString()).includes(s._id.toString())
        ),
      ];
    }

    res.json(orderedSections);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    let user = await User.findOne({ auth0Id: req.auth.sub });
    if (user) {
      return res.status(200).json(user);
    }
    const userData = {
      ...req.body,
      auth0Id: req.auth.sub
    };
    user = await User.create(userData);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data or duplicate user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
};