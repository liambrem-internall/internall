export const apiFetch = async ({
  endpoint,
  method = "GET",
  body,
  getAccessTokenSilently,
  ...options
}) => {
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
  return text ? JSON.parse(text) : {};
};