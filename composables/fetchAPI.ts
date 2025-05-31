const APIFetch = async (
  url: string | (() => string),
  options: RequestInit = {}
) => {
  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  const path = typeof url === "function" ? url() : url;

  // Determine if we're on the server or client
  const isServer = typeof window === "undefined";

  const baseURL = isServer
    ? `http://localhost:3000/api` // Use actual runtime base URL here
    : `/api`;

  const requestUrl = `${baseURL}${path}`;

  const response = await fetch(requestUrl, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default APIFetch;