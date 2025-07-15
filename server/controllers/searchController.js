const Item = require("../models/Item");
const Section = require("../models/Section");
const User = require("../models/User");
const Fuse = require("fuse.js");

const { ITEM_CONTENT_TYPES } = require("../utils/constants");

const THRESHOLD = 0.4;

const WEIGHTS = {
  CONTENT: 0.4,
  NOTES: 0.4,
  LINK: 0.2,
}

const fuzzySearchSections = (sections, query) => {
  const fuse = new Fuse(sections, {
    keys: ["title"],
    threshold: THRESHOLD,
  });
  return fuse.search(query).map((res) => res.item);
};

const fuzzySearchItems = (items, query) => {
  const fuse = new Fuse(items, {
    keys: [
      { name: ITEM_CONTENT_TYPES.CONTENT, weight: WEIGHTS.CONTENT },
      { name: ITEM_CONTENT_TYPES.NOTES, weight: WEIGHTS.NOTES },
      { name: ITEM_CONTENT_TYPES.LINK, weight: WEIGHTS.LINK },
    ],
    threshold: THRESHOLD,
  });

  return fuse.search(query).map((res) => {
    const item = res.item;
    let matchType = null;
    if (
      item.content &&
      item.content.toLowerCase().includes(query.toLowerCase())
    ) {
      matchType = ITEM_CONTENT_TYPES.CONTENT;
    } else if (
      item.notes &&
      item.notes.toLowerCase().includes(query.toLowerCase())
    ) {
      matchType = ITEM_CONTENT_TYPES.NOTES;
    } else if (
      item.link &&
      item.link.toLowerCase().includes(query.toLowerCase())
    ) {
      matchType = ITEM_CONTENT_TYPES.LINK;
    }

    console.log(`Fuzzy match found: ${item._id} (${matchType}) for query "${query}"`);
    return {
      ...item.toObject(),
      matchType,
    };
  });
};

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
}


exports.search = async (req, res) => {
  const { q, roomId } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });
  if (!roomId) return res.status(400).json({ error: "Missing roomId" });

  try {
    const user = await User.findOne({ username: roomId });
    if (!user) return res.status(404).json({ error: "User/Room not found" });

    const userSections = await Section.find({ userId: user.auth0Id });
    const sectionIds = userSections.map((section) => section._id);

    // Fuzzy search
    const fuzzySections = fuzzySearchSections(userSections, q);
    const itemsRaw = await Item.find({ sectionId: { $in: sectionIds } });
    const fuzzyItems = fuzzySearchItems(itemsRaw, q);

    // DuckDuckGo search
    const ddgData = await fetchDuckDuckGoData(q);

    // Semantic search
    const embedRes = await fetch(process.env.MICROSERVICE_URL + "/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [q] }),
    });
    const embedJson = await embedRes.json();
    const queryEmbedding = embedJson.embeddings[0];

    const semanticItems = itemsRaw
      .filter(item => item.embedding && item.embedding.length)
      .map(item => ({
        ...item.toObject(),
        similarity: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20);

    const semanticSections = userSections
      .filter(section => section.embedding && section.embedding.length)
      .map(section => ({
        ...section.toObject(),
        similarity: cosineSimilarity(queryEmbedding, section.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    res.json({
      items: fuzzyItems,
      sections: fuzzySections,
      duckduckgo: ddgData,
      semantic: {
        items: semanticItems,
        sections: semanticSections,
      }
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};