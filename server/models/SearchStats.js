const mongoose = require("mongoose");

const SearchStatsSchema = new mongoose.Schema({
  matchTypeCounts: {
    fuzzy: { type: Number, default: 0 },
    semantic: { type: Number, default: 0 },
    notes: { type: Number, default: 0 },
    link: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SearchStats", SearchStatsSchema);