/**
 * TrieNode represents a single node in the Trie data structure
 * Each node can have multiple children (one for each possible character)
 * and can mark the end of a complete word while storing associated items
 */
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.items = [];
  }
}

/**
 * Trie (Prefix Tree) data structure for efficient string searching
 * It's great for autocomplete, spell checking, and prefix-based searches
 * Time complexity: O(n) for insert/search/delete where n is word length
 */
export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a word and its associated item into the Trie
   * @param {string} word - The word to insert (will be converted to lowercase)
   * @param {Object} item - The data/item associated with this word
   */
  insert(word, item) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEnd = true;
    node.items.push(item);
  }

  /**
   * Search for all items that start with the given prefix
   * @param {string} prefix - The prefix to search for
   * @returns {Array} - Array of all items whose words start with the prefix
   */
  search(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this.collect(node);
  }

  /**
   * Recursively collect all items from a node and its descendants
   * This performs a depth-first traversal of the subtree
   * @param {TrieNode} node - The node to start collecting from
   * @returns {Array} - Array of all items found in the subtree
   */
  collect(node) {
    let results = [];
    if (node.isEnd) results = results.concat(node.items);
    for (const child in node.children) {
      results = results.concat(this.collect(node.children[child]));
    }
    return results;
  }

  /**
   * Remove a specific item associated with a word from the Trie
   * Also cleans up empty nodes to keep the Trie memory-efficient
   * @param {string} word - The word whose item should be removed
   * @param {Object} item - The specific item to remove (matched by _id)
   */
  remove(word, item) {
    let node = this.root;
    const stack = [];
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) return; // Not found
      stack.push([node, char]);
      node = node.children[char];
    }
    if (node.isEnd) {
      node.items = node.items.filter((i) => i._id !== item._id);
      if (node.items.length === 0) node.isEnd = false;
      // clean empty nodes
      while (
        stack.length &&
        Object.keys(node.children).length === 0 &&
        !node.isEnd
      ) {
        const [parent, char] = stack.pop();
        delete parent.children[char];
        node = parent;
      }
    }
  }
}
