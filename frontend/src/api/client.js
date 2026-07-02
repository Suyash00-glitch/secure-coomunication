/**
 * Shared API helpers for authenticated requests.
 * All calls go through the same origin (proxied by Vite in dev).
 */

export function getToken() {
  return typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(url, options = {}) {
  const headers = {
    ...authHeaders(),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  return res;
}

export async function apiJson(url, options = {}) {
  const res = await apiFetch(url, options);
  const data = await res.json();
  return { res, data };
}
