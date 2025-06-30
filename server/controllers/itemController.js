const Section = require('../models/Section');
const Item = require('../models/Item');

exports.getItems = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId).populate('items');
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section.items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    const newItem = new Item(req.body);
    await newItem.save();

    section.items.push(newItem._id);
    await section.save();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    await Item.findByIdAndDelete(req.params.itemId);
    section.items.pull(req.params.itemId);
    await section.save();

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
};