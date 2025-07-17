const URL = import.meta.env.VITE_API_URL;
export const combinedSearch = async (query, roomId, limit = 8, offset = 0) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/search/search?q=${encodeURIComponent(query)}&roomId=${roomId}&limit=${limit}&offset=${offset}`
  );
  return res.json();
};