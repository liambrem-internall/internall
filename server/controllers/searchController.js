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

const getRecencyScore = (lastSearchedAt) => {
  if (!lastSearchedAt) return 0;
  const now = Date.now();
  const diff = now - new Date(lastSearchedAt).getTime();
  // Decay: 1 if just now, 0 if a month ago
  const month = 1000 * 60 * 60 * 24 * 30;
  return Math.max(0, 1 - diff / month);
};

const getFrequencyScore = (searchCount) => {
  if (!searchCount) return 0;
  return Math.min(1, Math.log10(searchCount + 1) / 2); // log scale, max 1
};

const getUnifiedScore = ({
  fuzzyScore = 0,
  semanticScore = 0,
  freqScore = 0,
  recencyScore = 0,
  type = "item",
  ddgScore = 0,
}) => {
  if (type === "item") {
    // Tune weights as needed
    return (
      0.4 * fuzzyScore +
      0.4 * semanticScore +
      0.1 * freqScore +
      0.1 * recencyScore
    );
  } else if (type === "web") {
    return ddgScore; // or some other logic
  }
  return 0;
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

    const itemsRaw = await Item.find({ sectionId: { $in: sectionIds } });

    // Fuzzy and semantic scores
    const fuzzyResults = fuzzySearch(itemsRaw, q, "item");
    const queryEmbedding = await getEmbedding(q);

    // Map itemId to fuzzy score
    const fuzzyMap = {};
    fuzzyResults.forEach((item) => {
      fuzzyMap[item._id] = item.matchTypeScore || 0.0;
    });

    // Semantic scores
    const semanticMap = {};
    itemsRaw.forEach((item) => {
      if (item.embedding && item.embedding.length) {
        semanticMap[item._id] = cosineSimilarity(
          queryEmbedding,
          item.embedding
        );
      }
    });

    // Build unified item results
    const itemResults = itemsRaw.map((item) => {
      const fuzzyScore = fuzzyMap[item._id] || 0;
      const semanticScore = semanticMap[item._id] || 0;
      const freqScore = getFrequencyScore(item.searchCount);
      const recencyScore = getRecencyScore(item.lastSearchedAt);

      // Find matchType from fuzzyResults (if present)
      const fuzzyResult = fuzzyResults.find(
        (f) => f._id.toString() === item._id.toString()
      );
      const matchType = fuzzyResult ? fuzzyResult.matchType : null;

      const unifiedScore = getUnifiedScore({
        fuzzyScore,
        semanticScore,
        freqScore,
        recencyScore,
        type: "item",
      });

      return {
        type: "item",
        data: {
          ...item.toObject(),
          matchType,
          fuzzyScore,
          semanticScore,
          score: unifiedScore,
        },
        score: unifiedScore,
      };
    });

    // DDG results
    const ddgData = await fetchDuckDuckGoData(q);
    const ddgResults = (ddgData.RelatedTopics || [])
      .filter((topic) => topic.Text || topic.FirstURL)
      .map((topic) => ({
        type: "web",
        data: topic,
        score: 0.5, // You can tune this or use a keyword match score
      }));

    // Combine and sort all results
    const allResults = [...itemResults, ...ddgResults].sort(
      (a, b) => b.score - a.score
    );

    res.json({ results: allResults });
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
