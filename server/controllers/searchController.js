const Item = require("../models/Item");
const Section = require("../models/Section");
const User = require("../models/User");

const { COMPONENT_TYPES } = require("../utils/constants");
const { getEmbedding } = require("../utils/embedder");
const fuzzySearch = require("../utils/fuzzySearch");

const fetchDuckDuckGoData = async (query) => {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
    query
  )}&format=json`;
  const ddgRes = await fetch(url);
  return ddgRes.json();
};

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
};

exports.search = async (req, res) => {
  const { q, roomId } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });
  if (!roomId) return res.status(400).json({ error: "Missing roomId" });

  try {
    const user = await User.findOne({ username: roomId });
    if (!user) return res.status(404).json({ error: "User/Room not found" });

    const userSections = await Section.find({ userId: user.auth0Id });
    const sectionIds = userSections.map((section) => section._id);

    // fuzzy search
    const itemsRaw = await Item.find({ sectionId: { $in: sectionIds } });
    const fuzzyItems = fuzzySearch(itemsRaw, q, COMPONENT_TYPES.ITEM);

    // ddg search
    const ddgData = await fetchDuckDuckGoData(q);

    // semantic search
    const queryEmbedding = await getEmbedding(q);

    const semanticItems = itemsRaw
      .filter((item) => item.embedding && item.embedding.length)
      .map((item) => ({
        ...item.toObject(),
        similarity: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20);

    res.json({
      items: fuzzyItems,
      duckduckgo: ddgData,
      semantic: {
        items: semanticItems,
      },
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

exports.accessSearch = async (req, res) => {
  try {
    const { matchedIn } = req.body;
    console.log("Accessing search result in:", matchedIn);
    // Optionally: store matchedIn in a log or array for analytics
    // For now, just update access stats as before
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { searchCount: 1 },
        $set: { lastSearchedAt: new Date() },
        // Optionally: $push: { searchAccesses: { matchedIn, date: new Date() } }
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update access state" });
  }
};


exports.webAccessed = async (req, res) => {
  try {
    const { url, text, timestamp } = req.body;
    // Save to DB or log as needed
    console.log("Web result accessed:", { url, text, timestamp });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to log web access" });
  }
};