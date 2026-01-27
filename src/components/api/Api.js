export const fetchData = async (endpoint, method = 'POST', body = null, headers = {}) => {
  const BASE_URL = 'https://kasjewellery.in/';
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  try {
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : null,
    });
    // Check for HTTP errors
    if (!response.ok) {
      const text = await response.text(); // read HTML or error message
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    // Parse JSON safely
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('fetchData Error:', error);
    throw error; // re-throw to handle in caller
  }
};
