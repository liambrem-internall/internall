const MICROSERVICE_URL = process.env.MICROSERVICE_URL;
const MAX_CACHE_SIZE = 200;
const embedCache = new Map();

async function getEmbedding(text) {
  if (!text || typeof text !== "string" || !text.trim()) return null;

  // check the cache first and move accessed items to the end
  if (embedCache.has(text)) {
    const value = embedCache.get(text);
    embedCache.delete(text);
    embedCache.set(text, value);
    return value;
  }

  try {
    const res = await fetch(`${MICROSERVICE_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [text] }),
    });
    if (!res.ok) throw new Error("Embedding service error");
    const json = await res.json();
    const embedding = json.embeddings?.[0] || null;
    // store in cache
    if (embedding) {
      if (embedCache.size >= MAX_CACHE_SIZE) {
        const firstKey = embedCache.keys().next().value;
        embedCache.delete(firstKey); // remove the oldest entry
      }
      embedCache.set(text, embedding);
    }
    return embedding;
  } catch (err) {
    console.error("Embedding fetch failed:", err);
    return null;
  }
}

module.exports = { getEmbedding };
