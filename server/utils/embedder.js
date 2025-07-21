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

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Embedding service error:", res.status, errorText);
      return null;
    }

    let json;
    try {
      json = await res.json();
    } catch (jsonErr) {
      console.error("Failed to parse embedding service response as JSON:", jsonErr);
      return null;
    }

    const embedding = Array.isArray(json.embeddings?.[0]) ? json.embeddings[0] : null;
    if (!embedding) {
      console.error("No valid embedding returned for text:", text, "Response:", json);
      return null;
    }

    // store in cache
    if (embedCache.size >= MAX_CACHE_SIZE) {
      const firstKey = embedCache.keys().next().value;
      embedCache.delete(firstKey); // remove the oldest entry
    }
    embedCache.set(text, embedding);

    return embedding;
  } catch (err) {
    console.error("Embedding fetch failed:", err);
    return null;
  }
}

module.exports = { getEmbedding };
