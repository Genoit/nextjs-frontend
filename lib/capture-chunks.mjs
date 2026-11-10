// Base64 chunking for the extension -> app hand-off of ad media (up to 100 MB).
// browser-extension/background.js duplicates splitBase64 (it cannot import this file).
export const MAX_CHUNK = 8 * 1024 * 1024; // chars of base64 per chunk

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

/** Bytes -> base64 chunks of at most `max` chars; each chunk decodes on its own (3-byte groups). */
export function splitBase64(bytes, max = MAX_CHUNK) {
  const step = Math.floor(max / 4) * 3;
  const out = [];
  for (let i = 0; i < bytes.length; i += step) out.push(toBase64(bytes.subarray(i, i + step)));
  return out;
}

/** base64 chunks -> one byte array. */
export function joinBase64(chunks) {
  const parts = chunks.map((c) => Uint8Array.from(atob(c), (ch) => ch.charCodeAt(0)));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Media must come from Meta's CDN over https; the page's DOM is untrusted. Duplicated in background.js. */
export function isFbcdnUrl(url) {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' && (u.hostname === 'fbcdn.net' || u.hostname.endsWith('.fbcdn.net'))
    );
  } catch {
    return false;
  }
}
