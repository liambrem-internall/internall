export const apiFetch = async ({
  endpoint,
  method = "GET",
  body,
  getAccessTokenSilently,
  isOnline = true,
  ...options
}) => {

  if (!isOnline) {
    throw new Error("Offline: API call prevented");
  }

  const token = await getAccessTokenSilently();
  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions = {
    method,
    headers,
    ...options,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(endpoint, fetchOptions);
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
};
