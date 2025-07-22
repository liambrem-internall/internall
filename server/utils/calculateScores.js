const SearchStats = require("../models/SearchStats");
const { COMPONENT_TYPES } = require("./constants");

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
  type = COMPONENT_TYPES.ITEM,
  ddgScore = 0,
}) => {
  if (type === COMPONENT_TYPES.ITEM) {
    return (
      WEIGHTS.fuzzy * fuzzyScore +
      WEIGHTS.semantic * semanticScore +
      WEIGHTS.frequency * freqScore +
      WEIGHTS.recency * recencyScore
    );
  } else if (type === COMPONENT_TYPES.WEB) {
    return ddgScore;
  }
  return 0;
};


// calculates weights for each match type based on how often each type is clicked
// this allows the algorithm to adapt over time based on user behavior
// these are then used as the weights to calculate the priority of each match type
async function getDynamicWeights() {
  const stats = await SearchStats.findOne({});
  const counts = stats?.matchTypeCounts || {};
  const total =
    (counts.fuzzy || 0) +
    (counts.semantic || 0) +
    (counts.semanticGraph || 0) +
    (counts.frequency || 0) +
    (counts.recency || 0);

  if (!total) return { 
    fuzzy: 0.25, 
    semantic: 0.3, 
    semanticGraph: 0.25, 
    frequency: 0.1, 
    recency: 0.1 
  };

  return {
    fuzzy: (counts.fuzzy || 0) / total,
    semantic: (counts.semantic || 0) / total,
    semanticGraph: (counts.semanticGraph || 0) / total,
    frequency: (counts.frequency || 0) / total,
    recency: (counts.recency || 0) / total,
  };
}

const getUnifiedScoreDynamic = async ({
  fuzzyScore,
  semanticScore,
  semanticGraphScore,
  freqScore,
  recencyScore,
  type,
}) => {
  const weights = await getDynamicWeights();

  return (
    fuzzyScore * weights.fuzzy +
    semanticScore * weights.semantic +
    semanticGraphScore * weights.semanticGraph +
    freqScore * weights.frequency +
    recencyScore * weights.recency
  );
};

module.exports = {
  getRecencyScore,
  getFrequencyScore,
  getUnifiedScore,
  getUnifiedScoreDynamic,
  getDynamicWeights, 
};
