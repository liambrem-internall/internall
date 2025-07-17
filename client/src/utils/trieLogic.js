class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.items = [];
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, item) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEnd = true;
    node.items.push(item);
  }

  search(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this.collect(node);
  }

  collect(node) {
    let results = [];
    if (node.isEnd) results = results.concat(node.items);
    for (const child in node.children) {
      results = results.concat(this.collect(node.children[child]));
    }
    return results;
  }

  remove(word, item) {
  let node = this.root;
  const stack = [];
  for (const char of word.toLowerCase()) {
    if (!node.children[char]) return; // Not found
    stack.push([node, char]);
    node = node.children[char];
  }
  if (node.isEnd) {
    node.items = node.items.filter(i => i._id !== item._id);
    if (node.items.length === 0) node.isEnd = false;
    // clean empty nodes
    while (stack.length && Object.keys(node.children).length === 0 && !node.isEnd) {
      const [parent, char] = stack.pop();
      delete parent.children[char];
      node = parent;
    }
  }
}
}
