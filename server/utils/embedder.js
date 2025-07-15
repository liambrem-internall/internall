const MICROSERVICE_URL = process.env.MICROSERVICE_URL;

async function getEmbedding(text) {
  if (!text || typeof text !== "string" || !text.trim()) return null;
  try {
    const res = await fetch(`${MICROSERVICE_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [text] }),
    });
    if (!res.ok) throw new Error("Embedding service error");
    const json = await res.json();
    return json.embeddings?.[0] || null;
  } catch (err) {
    console.error("Embedding fetch failed:", err);
    return null;
  }
}

module.exports = { getEmbedding };