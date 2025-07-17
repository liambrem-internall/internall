const COMPONENT_TYPES = require("../utils/constants");

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
      0.4 * fuzzyScore +
      0.3 * semanticScore +
      0.2 * freqScore +
      0.1 * recencyScore
    );
  } else if (type === "web") {
    return ddgScore;
  }
  return 0;
};

module.exports = {
  getRecencyScore,
  getFrequencyScore,
  getUnifiedScore,
};
