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

// Ad Library capture: media can reach 100 MB, too big for sessionStorage (~5 MB), so the
// extension appends base64 chunks to IndexedDB here (see browser-extension/background.js).
export const AD_CAPTURE_KEY = 'trended:ad-capture';
export const AD_CAPTURE_EVENT = 'trended:ad-capture';

export type AdCaptureRecord = {
  adId: string;
  pageId: string;
  complete: boolean;
  files: { name: string; type: string; chunks: string[] }[];
};

function handoffStore<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    const open = indexedDB.open('trended', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('handoff');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const req = run(db.transaction('handoff', mode).objectStore('handoff'));
      req.onsuccess = () => {
        db.close();
        resolve(req.result);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    };
  });
}

/** The extension's finished ad capture, or null while it is missing or still being written. */
export async function readAdCapture(): Promise<AdCaptureRecord | null> {
  const r = await handoffStore<AdCaptureRecord | undefined>('readonly', (s) =>
    s.get(AD_CAPTURE_KEY),
  );
  return r && r.complete && typeof r.adId === 'string' && Array.isArray(r.files) ? r : null;
}

export async function deleteAdCapture(): Promise<void> {
  await handoffStore('readwrite', (s) => s.delete(AD_CAPTURE_KEY));
}
