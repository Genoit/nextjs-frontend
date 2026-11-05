// The "Send to TrendED" browser extension (browser-extension/) loads the product page in the
// user's own browser, so their IP and session pass anti-bot walls our server cannot.
// It drops the page here, in this tab's sessionStorage, then fires CAPTURE_EVENT.
const KEY = 'trended:capture';
export const CAPTURE_EVENT = 'trended:capture';

export type ExtensionCapture = { url: string; html: string };

export function takeExtensionCapture(): ExtensionCapture | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const c = JSON.parse(raw) as Partial<ExtensionCapture>;
    return typeof c.url === 'string' && typeof c.html === 'string'
      ? { url: c.url, html: c.html }
      : null;
  } catch {
    return null;
  }
}
