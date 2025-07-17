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

module.exports = {
  getRecencyScore,
  getFrequencyScore,
  getUnifiedScore,
};
