/*
 * This file defines the Item model for MongoDB
 */

const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  embedding: {
    type: [Number],
    default: [],
  },
  searchCount: {
    type: Number,
    default: 0,
  },
  lastSearchedAt: {
    type: Date,
    default: null,
  },
  searchAccesses: [
    {
      matchedIn: String,
      date: { type: Date, default: Date.now },
    },
  ],
  matchedInCounts: {
    type: Map,
    of: Number,
    default: {},
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Update lastModified on save
ItemSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model("Item", ItemSchema);
