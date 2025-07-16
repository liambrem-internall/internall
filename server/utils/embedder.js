const MICROSERVICE_URL = process.env.MICROSERVICE_URL;
const embedCache = new Map();

async function getEmbedding(text) {
  if (!text || typeof text !== "string" || !text.trim()) return null;

  // check the cache first
  if (embedCache.has(text)) {
    return embedCache.get(text);
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
    if (embedding) {
        embedCache.set(text, embedding);
    }
    return embedding;
  } catch (err) {
    console.error("Embedding fetch failed:", err);
    return null;
  }
}

module.exports = { getEmbedding };