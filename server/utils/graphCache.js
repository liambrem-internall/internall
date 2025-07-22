const SemanticSearchGraph = require('./SemanticSearchGraph');
const { cosineSimilarity } = require('./similarity');
const ACTIONS = require('./constants');
const EDGE_THRESHOLD = 0.4;



const graphCache = new Map();

function getGraph(roomId) {
  return graphCache.get(roomId);
}

function buildGraph(roomId, items) {
  const graph = new SemanticSearchGraph();
  items.forEach(item => graph.addItem(item));
  graph.buildEdges(cosineSimilarity, EDGE_THRESHOLD, true);
  graphCache.set(roomId, graph);
  return graph;
}

function updateGraph(roomId, item, action = ACTIONS.ADD) {
  let graph = graphCache.get(roomId);
  if (!graph) return;
  const id = item._id || item.id;
  if (action === ACTIONS.ADD) {
    graph.addItem(item);
    graph.buildEdges(cosineSimilarity, EDGE_THRESHOLD, true);
  }
  if (action === ACTIONS.UPDATE) {
    graph.nodes[id] = { item, embedding: item.embedding, edges: [] };
    graph.buildEdges(cosineSimilarity, EDGE_THRESHOLD, true);
  }
  if (action === ACTIONS.REMOVE) {
    delete graph.nodes[id];
    graph.buildEdges(cosineSimilarity, EDGE_THRESHOLD, true);
  }
}

function invalidateGraph(roomId) {
  graphCache.delete(roomId);
}

module.exports = { getGraph, buildGraph, updateGraph, invalidateGraph };