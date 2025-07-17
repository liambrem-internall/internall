const Item = require("../models/Item");
const Section = require("../models/Section");
const User = require("../models/User");

const { COMPONENT_TYPES } = require("../utils/constants");
const { getEmbedding } = require("../utils/embedder");
const fuzzySearch = require("../utils/fuzzySearch");

const { getFrequencyScore, getRecencyScore, getUnifiedScore } = require("../utils/calculateScores");

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

    const itemsRaw = await Item.find({ sectionId: { $in: sectionIds } });

    // fuzzy search results
    const fuzzyResults = fuzzySearch(itemsRaw, q, COMPONENT_TYPES.ITEM);
    const queryEmbedding = await getEmbedding(q);

    // map fuzzy results to their scores
    const fuzzyMap = {};
    fuzzyResults.forEach((item) => {
      fuzzyMap[item._id] = item.matchTypeScore || 0.0;
    });

    // semantic scores
    const semanticMap = {};
    itemsRaw.forEach((item) => {
      if (item.embedding && item.embedding.length) {
        semanticMap[item._id] = cosineSimilarity(
          queryEmbedding,
          item.embedding
        );
      }
    });

    const itemResults = itemsRaw.map((item) => {
      const fuzzyScore = fuzzyMap[item._id] || 0;
      const semanticScore = semanticMap[item._id] || 0;
      const freqScore = getFrequencyScore(item.searchCount);
      const recencyScore = getRecencyScore(item.lastSearchedAt);

      const fuzzyResult = fuzzyResults.find(
        (f) => f._id.toString() === item._id.toString()
      );
      const matchType = fuzzyResult ? fuzzyResult.matchType : null;

      const unifiedScore = getUnifiedScore({
        fuzzyScore,
        semanticScore,
        freqScore,
        recencyScore,
        type: COMPONENT_TYPES.ITEM,
      });

      return {
        type: COMPONENT_TYPES.ITEM,
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
        type: COMPONENT_TYPES.WEB,
        data: topic,
        score: 0.5,
      }));

    // combine & sort results by scores
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
    if (!matchedIn) return res.status(400).json({ error: "Missing matchedIn" });

    const incObj = {
      searchCount: 1,
      [`matchedInCounts.${matchedIn}`]: 1,
    };


    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        $inc: incObj,
        $set: { lastSearchedAt: new Date() },
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
