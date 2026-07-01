/**
 * Shared API helpers for authenticated requests.
 * Keeps backend compatibility — all calls go through the same origin
 * (proxied by Vite in dev, or same-host in production).
 */

export function getToken() {
  return typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Convenience wrapper around fetch that automatically attaches the
 * Authorization header and parses JSON.
 */
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
