const SearchStats = require("../models/SearchStats");

const WEIGHTS = {
    fuzzy: 0.4,
    semantic: 0.3,
    frequency: 0.2,
    recency: 0.1,
};

const getRecencyScore = (lastSearchedAt) => {
  if (!lastSearchedAt) return 0;
  const now = Date.now();
  const diff = now - new Date(lastSearchedAt).getTime();
  const month = 1000 * 60 * 60 * 24 * 30; // decay: 1 = Now, 0 = 30 days ago
  return Math.max(0, 1 - diff / month);
};

const getFrequencyScore = (searchCount) => {
  if (!searchCount) return 0;
  return Math.min(1, Math.log10(searchCount + 1) / 2);
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
    return (
      WEIGHTS.fuzzy * fuzzyScore +
      WEIGHTS.semantic * semanticScore +
      WEIGHTS.frequency * freqScore +
      WEIGHTS.recency * recencyScore
    );
  } else if (type === "web") {
    return ddgScore;
  }
  return 0;
};

async function getDynamicWeights() {
  const stats = await SearchStats.findOne({});
  const counts = stats?.matchTypeCounts || {};
  const total =
    (counts.fuzzy || 0) +
    (counts.semantic || 0) +
    (counts.frequency || 0) +
    (counts.recency || 0);

  if (!total) return { fuzzy: 0.4, semantic: 0.3, frequency: 0.2, recency: 0.1 };

  return {
    fuzzy: (counts.fuzzy || 0) / total,
    semantic: (counts.semantic || 0) / total,
    frequency: (counts.frequency || 0) / total,
    recency: (counts.recency || 0) / total,
  };
}

async function getUnifiedScoreDynamic(params) {
  const weights = await getDynamicWeights();
  return (
    weights.fuzzy * params.fuzzyScore +
    weights.semantic * params.semanticScore +
    weights.frequency * params.freqScore +
    weights.recency * params.recencyScore
  );
}

module.exports = {
  getRecencyScore,
  getFrequencyScore,
  getUnifiedScore,
  getUnifiedScoreDynamic,
};
