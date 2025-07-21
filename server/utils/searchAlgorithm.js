const { COMPONENT_TYPES } = require("./constants");
const {
  getFrequencyScore,
  getRecencyScore,
  getUnifiedScore,
  getUnifiedScoreDynamic,
} = require("./calculateScores");
const SemanticSearchGraph = require("./SemanticSearchGraph");
const { cosineSimilarity } = require("./similarity");

const getDominantMatchType = ({
  fuzzyScore,
  semanticScore,
  freqScore,
  recencyScore,
}) => {
  const scores = {
    fuzzy: fuzzyScore,
    semantic: semanticScore,
    frequency: freqScore,
    recency: recencyScore,
  };
  return Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
};

async function runSemanticGraphSearch({ itemsRaw, queryEmbedding }) {
  const graph = new SemanticSearchGraph();
  itemsRaw.forEach((item) => graph.addItem(item));
  
  // semantic graph search
  graph.buildEdges(cosineSimilarity, 0.8, true);
  const graphResults = graph.search(queryEmbedding, cosineSimilarity, 2, true);
  
  // return as a map of item ID to semantic graph score
  const semanticGraphScoreMap = {};
  graphResults.forEach((item, index) => {
    const itemId = item._id || item.id;
    semanticGraphScoreMap[itemId] = 0.9 - (index * 0.1); // Decreasing scores
  });
  
  return semanticGraphScoreMap;
}

async function runSearchAlgorithm({
  itemsRaw,
  fuzzyResults,
  queryEmbedding,
  ddgStats,
  ddgData,
  ItemModel,
  query,
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

  // Get only semantic graph score map
  const semanticGraphScoreMap = await runSemanticGraphSearch({ itemsRaw, queryEmbedding });

  const itemResults = await Promise.all(
    itemsRaw.map(async (item) => {
      const fuzzyScore = fuzzyMap[item._id] || 0;
      const semanticScore = semanticMap[item._id] || 0;
      const freqScore = getFrequencyScore(item.searchCount);
      const recencyScore = getRecencyScore(item.lastSearchedAt);
      
      // Add only semantic graph boost
      const semanticGraphBoost = semanticGraphScoreMap[item._id] || 0;

      const matchType = getDominantMatchType({
        fuzzyScore,
        semanticScore,
        freqScore,
        recencyScore,
      });

      let unifiedScore = await getUnifiedScoreDynamic({
        fuzzyScore,
        semanticScore,
        freqScore,
        recencyScore,
        type: COMPONENT_TYPES.ITEM,
      });

      // Apply semantic graph boost only
      if (semanticGraphBoost > 0) {
        unifiedScore *= (1 + semanticGraphBoost * 0.3); // 30% boost weight
      }

      return {
        type: COMPONENT_TYPES.ITEM,
        data: {
          ...item.toObject(),
          matchType,
          fuzzyScore,
          semanticScore,
          freqScore,
          recencyScore,
          semanticGraphBoost,
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

  // Combine results (no more duplicate items!)
  const allResults = [...itemResults, ...ddgResults];
  
  // Sort by score
  allResults.sort((a, b) => b.score - a.score);

  return allResults;
}

module.exports = { runSearchAlgorithm };
