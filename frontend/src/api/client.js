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

/**
 * Downloads a file from an authenticated (Bearer-token) API endpoint.
 *
 * A plain <a href="/api/..."> won't send the Authorization header, so this
 * fetches the file as a Blob with the existing auth headers, then triggers
 * a normal browser save using a temporary object URL. The suggested
 * filename is read from the response when possible (Content-Disposition),
 * falling back to the filename the caller already knows about.
 *
 * Returns { ok: true } on success, or { ok: false, message } on failure —
 * never throws, so callers can show a safe inline error.
 */
export async function downloadAttachment(url, fallbackFileName) {
  try {
    const res = await apiFetch(url);

    if (!res.ok) {
      let message = "Unable to download attachment.";
      try {
        const data = await res.json();
        if (data?.message) message = data.message;
      } catch {
        // response wasn't JSON — keep the generic message
      }
      return { ok: false, message };
    }

    const blob = await res.blob();

    let fileName = fallbackFileName || "download";
    const disposition = res.headers.get("Content-Disposition");
    if (disposition) {
      const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);

    return { ok: true };
  } catch (err) {
    console.log(err);
    return { ok: false, message: "Unable to connect to server." };
  }
}
