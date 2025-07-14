const URL = import.meta.env.VITE_API_URL;
export async function duckDuckGoSearch(query) {
  const url = `${URL}/api/search/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  return await res.json();
}