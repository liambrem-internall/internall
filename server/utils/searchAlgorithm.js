const { COMPONENT_TYPES } = require("./constants");
const {
  getFrequencyScore,
  getRecencyScore,
  getUnifiedScore,
  getUnifiedScoreDynamic,
} = require("./calculateScores");

const cosineSimilarity = (a, b) => {
  if (!a || !b) return 0;
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
};

const getDominantMatchType = ({ fuzzyScore, semanticScore, freqScore, recencyScore }) => {
  const scores = {
    fuzzy: fuzzyScore,
    semantic: semanticScore,
    frequency: freqScore,
    recency: recencyScore,
  };
  return Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
};

async function runSearchAlgorithm({
  itemsRaw,
  fuzzyResults,
  queryEmbedding,
  ddgStats,
  ddgData,
  ItemModel,
}) {
  // map fuzzy results to their scores
  const fuzzyMap = {};
  fuzzyResults.forEach((item) => {
    fuzzyMap[item._id] = item.matchTypeScore || 0.0;
  });

  // semantic scores
  const semanticMap = {};
  itemsRaw.forEach((item) => {
    if (item.embedding && item.embedding.length) {
      semanticMap[item._id] = cosineSimilarity(queryEmbedding, item.embedding);
    }
  });

  const itemResults = await Promise.all(
    itemsRaw.map(async (item) => {
      const fuzzyScore = fuzzyMap[item._id] || 0;
      const semanticScore = semanticMap[item._id] || 0;
      const freqScore = getFrequencyScore(item.searchCount);
      const recencyScore = getRecencyScore(item.lastSearchedAt);

      const matchType = getDominantMatchType({ fuzzyScore, semanticScore, freqScore, recencyScore });

      const unifiedScore = await getUnifiedScoreDynamic({
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
          freqScore,
          recencyScore,
          score: unifiedScore,
        },
        score: unifiedScore,
      };
    })
  );

  const ddgClicks = ddgStats?.totalClicks || 0;
  const itemClicks = await ItemModel.aggregate([
    { $group: { _id: null, total: { $sum: "$searchCount" } } },
  ]);
  const totalItemClicks = itemClicks[0]?.total || 0;

  // find the percentage of DDG clicks
  const ddgPercent =
    ddgClicks + totalItemClicks > 0
      ? ddgClicks / (ddgClicks + totalItemClicks)
      : 0;

  // DDG results
  const ddgResults = (ddgData.RelatedTopics || [])
    .filter((topic) => topic.Text || topic.FirstURL)
    .map((topic) => ({
      type: COMPONENT_TYPES.WEB,
      data: {
        ...topic,
        ddgPercent,
      },
      score: 0.2 + ddgPercent,
    }));

  // combine & sort results by scores
  const allResults = [...itemResults, ...ddgResults].sort(
    (a, b) => b.score - a.score
  );

  return allResults;
}

module.exports = { runSearchAlgorithm };
