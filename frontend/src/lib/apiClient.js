// API client that replaces the Supabase client.
// All requests go to VITE_APP_URL (your own backend).
// The JWT token is stored in localStorage under 'tap_token'.

const API_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('tap_token');
}

async function request(
  method,
  path,
  body
) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined;
  return res.json();
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
  setToken: (token) => localStorage.setItem('tap_token', token),
  clearToken: () => localStorage.removeItem('tap_token'),
  hasToken: () => !!localStorage.getItem('tap_token'),
};

export default api;
