const SemanticSearchGraph = require('./SemanticSearchGraph');
const { cosineSimilarity } = require('./similarity');

const graphCache = new Map();

function getGraph(roomId) {
  return graphCache.get(roomId);
}

function buildGraph(roomId, items) {
  const graph = new SemanticSearchGraph();
  items.forEach(item => graph.addItem(item));
  graph.buildEdges(cosineSimilarity, 0.4, true);
  graphCache.set(roomId, graph);
  return graph;
}

function updateGraph(roomId, item, action = 'add') {
  let graph = graphCache.get(roomId);
  if (!graph) return;
  const id = item._id || item.id;
  if (action === 'add') {
    graph.addItem(item);
    graph.buildEdges(cosineSimilarity, 0.4, true);
  }
  if (action === 'update') {
    graph.nodes[id] = { item, embedding: item.embedding, edges: [] };
    graph.buildEdges(cosineSimilarity, 0.4, true);
  }
  if (action === 'remove') {
    delete graph.nodes[id];
    graph.buildEdges(cosineSimilarity, 0.4, true);
  }
}

function invalidateGraph(roomId) {
  graphCache.delete(roomId);
}

module.exports = { getGraph, buildGraph, updateGraph, invalidateGraph };