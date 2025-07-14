const URL = import.meta.env.VITE_API_URL;
export async function combinedSearch(query, roomId) {
  const url = `${URL}/api/search/search?q=${encodeURIComponent(query)}&roomId=${encodeURIComponent(roomId)}`;
  const res = await fetch(url);
  return await res.json();
}