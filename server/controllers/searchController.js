exports.webSearch = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      q
    )}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "DuckDuckGo fetch failed" });
  }
};
