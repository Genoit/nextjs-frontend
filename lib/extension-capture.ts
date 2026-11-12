// The "Send to TrendED" browser extension (browser-extension/) loads the product page in the
// user's own browser, so their IP and session pass anti-bot walls our server cannot.
// It drops the page here, in this tab's sessionStorage, then fires CAPTURE_EVENT.
import {
  MANIFEST_KEY,
  handoffPrefix,
  isReadyManifest,
  manifestChunkKeys,
} from './capture-chunks.mjs';

const KEY = 'trended:capture';
export const CAPTURE_EVENT = 'trended:capture';

export type ExtensionCapture = { url: string; html: string };

function take(key: string): ExtensionCapture | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    sessionStorage.removeItem(key);
    const c = JSON.parse(raw) as Partial<ExtensionCapture>;
    return typeof c.url === 'string' && typeof c.html === 'string'
      ? { url: c.url, html: c.html }
      : null;
  } catch {
    return null;
  }
}

export function takeExtensionCapture(): ExtensionCapture | null {
  return take(KEY);
}

// A Shopify store's home or collection page, for the store panel (/stores/inspect).
export const STORE_CAPTURE_EVENT = 'trended:store-capture';

export function takeStoreCapture(): ExtensionCapture | null {
  return take(STORE_CAPTURE_EVENT);
}

// Ad Library capture: media can reach 100 MB, too big for sessionStorage (~5 MB), so the
// extension writes a small manifest plus one IndexedDB record per base64 chunk
// (see browser-extension/background.js and lib/capture-chunks.mjs).
export const AD_CAPTURE_EVENT = 'trended:ad-capture';

export type AdCaptureManifest = {
  nonce: string;
  adId: string;
  pageId: string;
  complete: boolean;
  files: { name: string; type: string; chunks: number }[];
};

function handoffTx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => () => T) {
  return new Promise<T>((resolve, reject) => {
    const open = indexedDB.open('trended', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('handoff');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('handoff', mode);
      const result = run(tx.objectStore('handoff'));
      tx.oncomplete = () => {
        db.close();
        resolve(result());
      };
      tx.onerror = tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}

/** This hand-off's manifest once complete, else null. Reads only the small manifest record. */
export async function readAdManifest(nonce: string): Promise<AdCaptureManifest | null> {
  const m = await handoffTx('readonly', (s) => {
    const req = s.get(MANIFEST_KEY);
    return () => req.result as unknown;
  });
  return isReadyManifest(m, nonce) ? (m as AdCaptureManifest) : null;
}

/** Each file's base64 chunks, in order, read in one transaction. */
export async function readAdChunks(m: AdCaptureManifest): Promise<string[][]> {
  return handoffTx('readonly', (s) => {
    const reqs = (manifestChunkKeys(m) as string[][]).map((keys) => keys.map((k) => s.get(k)));
    return () =>
      reqs.map((file) =>
        file.map((r) => {
          if (typeof r.result !== 'string') throw new Error('capture chunk missing');
          return r.result;
        }),
      );
  });
}

/** Deletes this hand-off's chunks, and the manifest while it still belongs to it. */
export async function deleteAdCapture(nonce: string): Promise<void> {
  await handoffTx('readwrite', (s) => {
    const prefix = handoffPrefix(nonce);
    s.delete(IDBKeyRange.bound(prefix, `${prefix}\uffff`));
    const req = s.get(MANIFEST_KEY);
    req.onsuccess = () => {
      if ((req.result as { nonce?: string } | undefined)?.nonce === nonce) s.delete(MANIFEST_KEY);
    };
    return () => undefined;
  });
}
