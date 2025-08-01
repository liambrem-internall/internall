/*
 * This file defines the Section model for MongoDB
 */

const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  embedding: {
    type: [Number],
    default: []
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// update lastModified on save
SectionSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model("Section", SectionSchema);
