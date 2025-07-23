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

  const response = await fetch(endpoint, fetchOptions);
  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
};
