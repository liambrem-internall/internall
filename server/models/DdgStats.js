/*
 * This file defines the DdgStats model for MongoDB
 */

const mongoose = require("mongoose");

const DdgStatsSchema = new mongoose.Schema({
  totalClicks: { type: Number, default: 0 },
});

module.exports = mongoose.model("DdgStats", DdgStatsSchema);