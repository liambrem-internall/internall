const mongoose = require("mongoose");

const SearchStatsSchema = new mongoose.Schema({
  matchTypeCounts: {
    fuzzy: { type: Number, default: 0 },
    semantic: { type: Number, default: 0 },
    frequency: { type: Number, default: 0 },
    recency: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SearchStats", SearchStatsSchema);