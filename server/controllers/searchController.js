const Item = require("../models/Item");
const Section = require("../models/Section");
const User = require("../models/User");

const { ITEM_CONTENT_TYPES } = require("../utils/constants");

// escape special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.search = async (req, res) => {
  const { q, roomId } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });
  if (!roomId) return res.status(400).json({ error: "Missing roomId" });

  try {
    const user = await User.findOne({ username: roomId });
    if (!user) return res.status(404).json({ error: "User/Room not found" });

    const safeQuery = escapeRegex(q);

    const sections = await Section.find({
      userId: user.auth0Id,
      title: { $regex: safeQuery, $options: "i" },
    });

    // get all sections for this user then find items in those sections
    const userSections = await Section.find({ userId: user.auth0Id });
    const sectionIds = userSections.map(section => section._id);
    
    const itemsRaw = await Item.find({ sectionId: { $in: sectionIds } });

    const matchedItems = [];
    const lowerQuery = safeQuery.toLowerCase();

    itemsRaw.forEach((item) => {
      let matchType = null;
      if (item.content && item.content.toLowerCase().includes(lowerQuery)) {
        matchType = ITEM_CONTENT_TYPES.CONTENT;
      } else if (item.notes && item.notes.toLowerCase().includes(lowerQuery)) {
        matchType = ITEM_CONTENT_TYPES.NOTES;
      } else if (item.link && item.link.toLowerCase().includes(lowerQuery)) {
        matchType = ITEM_CONTENT_TYPES.LINK;
      }
      if (matchType) {
        matchedItems.push({
          ...item.toObject(),
          matchType,
        });
      }
    });

    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      q
    )}&format=json`;
    const ddgRes = await fetch(url);
    const ddgData = await ddgRes.json();

    res.json({
      items: matchedItems,
      sections,
      duckduckgo: ddgData,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};