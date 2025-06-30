const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', ItemSchema);