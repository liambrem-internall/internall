const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  link: {
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