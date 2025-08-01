/*
 * This file handles the search endpoints
 */

const Item = require("../models/Item");
const Section = require("../models/Section");
const User = require("../models/User");
const DdgStats = require("../models/DdgStats");
const SearchStats = require("../models/SearchStats");

const { COMPONENT_TYPES } = require("../utils/constants");
const { getEmbedding } = require("../utils/embedder");
const { fuzzySearch } = require("../utils/fuzzySearch");
const { runSearchAlgorithm } = require("../utils/searchAlgorithm");
const { getGraph, buildGraph } = require("../utils/graphCache");

const PAGE_SIZE_DEFAULT = 8;
const OFFSET_DEFAULT = 0;
const STRING_MAX = 50;

const fetchDuckDuckGoData = async (query) => {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
    query
  )}&format=json`;
  const ddgRes = await fetch(url);
  return ddgRes.json();
};

exports.search = async (req, res) => {
  const { q, roomId } = req.query;
  const limit = parseInt(req.query.limit, 10) || PAGE_SIZE_DEFAULT;
  const offset = parseInt(req.query.offset, 10) || OFFSET_DEFAULT;
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
    const ddgStats = await DdgStats.findOne({});
    const ddgData = await fetchDuckDuckGoData(q);

    const results = await runSearchAlgorithm({
      itemsRaw,
      fuzzyResults,
      queryEmbedding,
      ddgStats,
      ddgData,
      ItemModel: Item,
      query: q,
      roomId,
    });

    const pagedResults = results.slice(offset, offset + limit);

    res.json({ results: pagedResults, total: results.length });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

const MATCH_TYPES = ["fuzzy", "semantic", "frequency", "recency"];

exports.accessSearch = async (req, res) => {
  try {
    const {
      fuzzyScore = 0,
      semanticScore = 0,
      frequencyScore = 0,
      recencyScore = 0,
    } = req.body;

    // update item stats
    await Item.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { searchCount: 1 },
        $set: { lastSearchedAt: new Date() },
        $push: {
          searchAccesses: {
            fuzzyScore,
            semanticScore,
            frequencyScore,
            recencyScore,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    const incObj = {};
    MATCH_TYPES.forEach((type) => {
      incObj[`matchTypeCounts.${type}`] = req.body[`${type}Score`] || 0;
    });

    // update global stats proportionally
    await SearchStats.findOneAndUpdate(
      {},
      {
        $inc: incObj,
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update access state" });
  }
};

exports.webAccessed = async (req, res) => {
  try {
    await DdgStats.findOneAndUpdate(
      {},
      { $inc: { totalClicks: 1 } },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to log web access" });
  }
};

exports.getSemanticGraph = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) return res.status(400).json({ error: "Missing roomId" });

    const user = await User.findOne({ username: roomId });
    if (!user) return res.status(404).json({ error: "User/Room not found" });

    const userSections = await Section.find({ userId: user.auth0Id });
    const sectionIds = userSections.map((section) => section._id);
    const itemsRaw = await Item.find({ sectionId: { $in: sectionIds } });

    // pull graph from cache
    let graph = getGraph(roomId);
    if (!graph) {
      graph = buildGraph(roomId, itemsRaw);
    }

    const nodes = Object.entries(graph.nodes).map(([id, node]) => ({
      id,
      label: (node.item.title || node.item.content || "Untitled").substring(
        0,
        STRING_MAX
      ),
      hasEmbedding: !!(node.item.embedding && node.item.embedding.length > 0),
    }));

    const edges = [];
    Object.entries(graph.nodes).forEach(([id, node]) => {
      node.edges.forEach((edge) => {
        edges.push({ source: id, target: edge.id, weight: edge.weight });
      });
    });

    res.json({ nodes, edges });
  } catch (err) {
    console.error("Semantic graph error:", err);
    res.status(500).json({ error: "Failed to generate semantic graph" });
  }
};
