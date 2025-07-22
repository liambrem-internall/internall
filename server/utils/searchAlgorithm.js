const { COMPONENT_TYPES } = require("./constants");
const {
  getFrequencyScore,
  getRecencyScore,
  getUnifiedScore,
  getUnifiedScoreDynamic,
} = require("./calculateScores");
const { cosineSimilarity } = require("./similarity");
const { getGraph, buildGraph } = require("./graphCache");

const getDominantMatchType = ({
  fuzzyScore,
  semanticScore,
  semanticGraphScore,
  freqScore,
  recencyScore,
}) => {
  const scores = {
    fuzzy: fuzzyScore,
    semantic: semanticScore,
    semanticGraph: semanticGraphScore,
    frequency: freqScore,
    recency: recencyScore,
  };
  return Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
};

async function runSemanticGraphSearch({ itemsRaw, queryEmbedding, roomId }) {
  let graph = getGraph(roomId);
  if (!graph) {
    graph = buildGraph(roomId, itemsRaw);
  }
  const graphResults = graph.search(queryEmbedding, cosineSimilarity, 2, true);

  const semanticGraphScoreMap = {};
  graphResults.forEach((item, index) => {
    const itemId = item._id || item.id;
    semanticGraphScoreMap[itemId] = 0.9 - (index * 0.1); // decreasing scores
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
  roomId,
}) {
  // map fuzzy results to their scores
  const fuzzyMap = {};
  fuzzyResults.forEach((item) => {
    fuzzyMap[item._id] = item.matchTypeScore || 0.0;
  });

  // regular semantic scores (cosine similarity with query embedding)
  const semanticMap = {};
  itemsRaw.forEach((item) => {
    if (item.embedding && item.embedding.length) {
      semanticMap[item._id] = cosineSimilarity(queryEmbedding, item.embedding);
    }
  });

  // semantic graph scores (graph-based semantic search)
  const semanticGraphScoreMap = await runSemanticGraphSearch({ itemsRaw, queryEmbedding, roomId });

  const itemResults = await Promise.all(
    itemsRaw.map(async (item) => {
      const fuzzyScore = fuzzyMap[item._id] || 0;
      const semanticScore = semanticMap[item._id] || 0;
      const semanticGraphScore = semanticGraphScoreMap[item._id] || 0;
      const freqScore = getFrequencyScore(item.searchCount);
      const recencyScore = getRecencyScore(item.lastSearchedAt);

      const matchType = getDominantMatchType({
        fuzzyScore,
        semanticScore,
        semanticGraphScore,
        freqScore,
        recencyScore,
      });

      let unifiedScore = await getUnifiedScoreDynamic({
        fuzzyScore,
        semanticScore,
        semanticGraphScore,
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
          semanticGraphScore,
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

  const allResults = [...itemResults, ...ddgResults];
  allResults.sort((a, b) => b.score - a.score);

  return allResults;
}

module.exports = { runSearchAlgorithm };
