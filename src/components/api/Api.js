export const BASE_URL = 'https://kasjewellery.com/';
const Live_URL = 'https://kasjewellery.in/';
export const fetchData = async (endpoint, method = 'POST', body = null, headers = {}) => {
  // const BASE_URL = 'https://kasjewellery.in/';
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
    if (!response.ok) {
      const text = await response.text(); // read HTML or error message
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('fetchData Error:', error);
    throw error; // re-throw to handle in caller
  }
};
