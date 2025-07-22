const EDGE_THRESHOLD = 0.4;
const SIMILARITY_THRESHOLD = 0.5;

class SemanticSearchGraph {
  constructor() {
    this.nodes = {}; // id -> { item, embedding, edges: [{ id, weight }] }
    this.invertedIndex = {}; // word -> Set of ids
  }

  addItem(item) {
    const id = item._id || item.id;
    this.nodes[id] = { item, embedding: item.embedding, edges: [] };
    const text = [item.title, item.content, item.notes, item.link]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    for (const word of text.split(/\W+/)) {
      if (!word) continue;
      if (!this.invertedIndex[word]) this.invertedIndex[word] = new Set();
      this.invertedIndex[word].add(id);
    }
  }

  buildEdges(similarityFn, threshold = EDGE_THRESHOLD) {
    const ids = Object.keys(this.nodes);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = this.nodes[ids[i]].embedding;
        const b = this.nodes[ids[j]].embedding;
        if (!a || !b) continue;
        const sim = similarityFn(a, b);
        if (sim >= threshold) {
          this.nodes[ids[i]].edges.push({ id: ids[j], weight: sim });
          this.nodes[ids[j]].edges.push({ id: ids[i], weight: sim });
        }
      }
    }
  }


  // uses a BFS approach to find items similar to the query embedding
  search(query, similarityFn, maxDepth = 2) {
    const candidateIds = Object.keys(this.nodes).filter(
      (id) =>
        this.nodes[id].embedding &&
        similarityFn(query, this.nodes[id].embedding) > SIMILARITY_THRESHOLD
    );

    const results = {};
    for (const startId of candidateIds) {
      const visited = new Set([startId]);
      const queue = [{ id: startId, depth: 0, score: 1 }];
      while (queue.length) {
        const { id, depth, score } = queue.shift();
        if (!results[id] || results[id] < score) results[id] = score;
        if (depth < maxDepth) {
          for (const edge of this.nodes[id].edges) {
            if (!visited.has(edge.id)) {
              visited.add(edge.id);
              queue.push({
                id: edge.id,
                depth: depth + 1,
                score: score * edge.weight,
              });
            }
          }
        }
      }
    }
    return Object.entries(results)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.nodes[id].item);
  }
}

module.exports = SemanticSearchGraph;
