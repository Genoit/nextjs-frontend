// Reads the product page in the user's own browser (their IP, their session, any captcha
// they already passed), then hands it to TrendED's product-input page. No server fetch.
// shortcut: local Docker app only; set the production origin here and in manifest host_permissions at deploy.
const APP_ORIGIN = 'http://localhost:3000';

async function sendTab(tab) {
  if (!tab.id || !/^https?:\/\//.test(tab.url || '')) return;
  const [{ result: capture }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({ url: location.href, html: document.documentElement.outerHTML }),
  });
  const app = await chrome.tabs.create({ url: `${APP_ORIGIN}/product-input?from=extension` });
  chrome.tabs.onUpdated.addListener(function handOff(tabId, info) {
    if (tabId !== app.id || info.status !== 'complete') return;
    chrome.tabs.onUpdated.removeListener(handOff);
    chrome.scripting.executeScript({
      target: { tabId },
      args: [capture],
      // Same key and event as lib/extension-capture.ts.
      func: (c) => {
        sessionStorage.setItem('trended:capture', JSON.stringify(c));
        window.dispatchEvent(new Event('trended:capture'));
      },
    });
  });
}

// ---- Meta Ad Library: capture the ad's media (images / video) and hand it to /ads/capture ----
const MAX_TOTAL = 100 * 1024 * 1024; // global-constraints P2
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
const MAX_CHUNK = 8 * 1024 * 1024; // chars of base64 per executeScript call (JSON message limit ~64 MiB)

// Duplicate of adIdFromLibraryUrl / isAdLibraryUrl in lib/ads-rules.mjs (cannot import .mjs here).
function adLibraryUrl(url) {
  try {
    const u = new URL(url);
    const ok =
      (u.hostname === 'www.facebook.com' || u.hostname === 'facebook.com') &&
      u.pathname.startsWith('/ads/library');
    return ok ? u : null;
  } catch {
    return null;
  }
}
const isAdLibraryUrl = (url) => adLibraryUrl(url) !== null;

// Duplicate of isFbcdnUrl in lib/capture-chunks.mjs (unit-tested there).
function isFbcdnUrl(url) {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' && (u.hostname === 'fbcdn.net' || u.hostname.endsWith('.fbcdn.net'))
    );
  } catch {
    return false;
  }
}

// Runs in the Ad Library tab. Returns only small data; the files are fetched by the worker.
function readAdPage() {
  const u = new URL(location.href);
  const id = u.searchParams.get('id');
  const adId = id && /^\d+$/.test(id) ? id : null;
  if (!adId) return { error: 'no_ad' };
  // shortcut: DOM selectors unverified until the live checklist; adjust on the real page
  // --- selectors start ---
  const ID_TEXT = `Library ID: ${adId}`; // text node that sits inside the ad's card
  const MEDIA = 'video[src], img';
  const ADVERTISER_LINK = 'a[href*="facebook.com/"]';
  // --- selectors end ---
  let box = null;
  const label = [...document.querySelectorAll('span, div')].find(
    (e) => e.children.length === 0 && (e.textContent || '').includes(ID_TEXT),
  );
  for (let el = label; el && el !== document.body; el = el.parentElement) {
    if (el.querySelector(MEDIA)) {
      box = el;
      break;
    }
  }
  // Never fall back to the whole page: media or links outside the ad's card are not this ad's.
  if (!box) return { error: 'no_ad' };
  let pageId = null;
  for (const a of box.querySelectorAll(ADVERTISER_LINK)) {
    try {
      const h = new URL(a.href);
      const m = h.pathname.match(/^\/(\d{5,})(\/|$)/);
      const q = h.searchParams.get('id') || h.searchParams.get('view_all_page_id');
      pageId = m ? m[1] : q && /^\d+$/.test(q) ? q : null;
    } catch {
      /* skip */
    }
    if (pageId) break;
  }
  const media = [];
  for (const el of box.querySelectorAll(MEDIA)) {
    if (el.tagName === 'VIDEO') {
      if (el.src) media.push({ url: el.src, kind: 'video' });
    } else if ((el.naturalWidth || el.width) > 200 && el.src) {
      media.push({ url: el.src, kind: 'image' });
    }
  }
  return {
    adId,
    pageId,
    media: media.filter((m, i) => media.findIndex((x) => x.url === m.url) === i),
  };
}

// Duplicate of splitBase64 in lib/capture-chunks.mjs (unit-tested there).
function splitBase64(bytes, max = MAX_CHUNK) {
  const step = Math.floor(max / 4) * 3;
  const out = [];
  for (let i = 0; i < bytes.length; i += step) {
    const part = bytes.subarray(i, i + step);
    let s = '';
    for (let j = 0; j < part.length; j += 0x8000)
      s += String.fromCharCode(...part.subarray(j, j + 0x8000));
    out.push(btoa(s));
  }
  return out;
}

function adFail(tabId, why) {
  chrome.action.setBadgeBackgroundColor({ color: '#c0392b', tabId });
  chrome.action.setBadgeText({ text: '!', tabId });
  chrome.action.setTitle({ title: `TrendED: ${why}`, tabId });
}

// Runs in the app tab (self-contained: executeScript cannot see this file's helpers).
// op: start | chunk | done. A small manifest under KEY plus one record per chunk under
// `${KEY}:<nonce>:<file>:<chunk>` (duplicates chunkKey in lib/capture-chunks.mjs), so no op ever
// rewrites the whole capture. Every op fires the event: the page re-reads only the manifest on
// it, and each one counts as progress for its timeout.
function writeHandoff(op, a) {
  const KEY = 'trended:ad-capture';
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('trended', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('handoff');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('handoff', 'readwrite');
      tx.onerror = tx.onabort = () => {
        db.close();
        reject(tx.error || new Error('handoff failed'));
      };
      tx.oncomplete = () => {
        db.close();
        window.dispatchEvent(new Event('trended:ad-capture'));
        resolve();
      };
      const store = tx.objectStore('handoff');
      if (op === 'start') {
        // A new hand-off first drops every older one (tab closed mid-upload, failed run).
        store.delete(IDBKeyRange.bound(`${KEY}:`, `${KEY}:\uffff`));
        store.put(
          { nonce: a.nonce, adId: a.adId, pageId: a.pageId, files: a.files, complete: false },
          KEY,
        );
        return;
      }
      const get = store.get(KEY);
      get.onsuccess = () => {
        const m = get.result;
        // The page gave up (and cleaned up) or a newer hand-off took over: stop writing.
        if (!m || m.nonce !== a.nonce) return tx.abort();
        if (op === 'chunk') store.put(a.chunk, `${KEY}:${a.nonce}:${a.file}:${a.n}`);
        else store.put({ ...m, complete: true }, KEY);
      };
    };
  });
}

// Reads one media URL into bytes, or null when it is not usable. Checks the type and the size
// before and during the read, so a hostile or huge body is never fully buffered.
async function fetchMedia(url, budget, onProgress) {
  if (!isFbcdnUrl(url)) return null;
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok || !isFbcdnUrl(res.url)) return null; // a redirect must stay on the CDN too
  const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED.includes(type)) return null;
  const len = Number(res.headers.get('content-length'));
  if (len > budget) return null;
  const parts = [];
  let got = 0;
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    got += value.length;
    if (got > budget) {
      await reader.cancel();
      return null;
    }
    parts.push(value);
    onProgress(got);
  }
  const bytes = new Uint8Array(got);
  let at = 0;
  for (const p of parts) {
    bytes.set(p, at);
    at += p.length;
  }
  return { type, bytes };
}

async function sendAd(tab) {
  // A new attempt clears the previous failure.
  chrome.action.setBadgeText({ text: '', tabId: tab.id });
  const [{ result: page }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: readAdPage,
  });
  if (!page || page.error || !page.pageId) return adFail(tab.id, "couldn't read this ad");
  const files = [];
  let total = 0;
  let lastTick = 0;
  for (const m of page.media) {
    try {
      // Badge updates are extension API calls: they reset the service worker's idle timer, so a
      // long download is not killed mid-fetch (Chrome stops an idle worker after ~30 s).
      const f = await fetchMedia(m.url, MAX_TOTAL - total, (got) => {
        if (Date.now() - lastTick < 2000) return;
        lastTick = Date.now();
        chrome.action.setBadgeText({
          text: `${Math.round((total + got) / 1048576)}M`,
          tabId: tab.id,
        });
      });
      if (!f) continue;
      total += f.bytes.length;
      const ext = f.type.split('/')[1].replace('jpeg', 'jpg');
      files.push({
        name: `ad-${page.adId}-${files.length + 1}.${ext}`,
        type: f.type,
        bytes: f.bytes,
      });
    } catch {
      /* unreachable media: skip */
    }
  }
  if (!files.length) return adFail(tab.id, 'no usable media found in this ad');
  const run = (tabId, op, args) =>
    chrome.scripting.executeScript({ target: { tabId }, func: writeHandoff, args: [op, args] });
  const nonce = crypto.randomUUID();
  const step = Math.floor(MAX_CHUNK / 4) * 3; // bytes per chunk, as in splitBase64
  const handOff = async (tabId) => {
    await run(tabId, 'start', {
      nonce,
      adId: page.adId,
      pageId: page.pageId,
      files: files.map((f) => ({
        name: f.name,
        type: f.type,
        chunks: Math.ceil(f.bytes.length / step),
      })),
    });
    for (const [i, f] of files.entries()) {
      for (const [n, chunk] of splitBase64(f.bytes).entries()) {
        await run(tabId, 'chunk', { nonce, file: i, n, chunk });
      }
    }
    await run(tabId, 'done', { nonce });
    chrome.action.setBadgeText({ text: '', tabId: tab.id });
  };
  // Listen before creating the tab, and also check its status after: a fast 'complete' is never missed.
  let appId = null;
  let started = false;
  const go = (tabId) => {
    if (started) return;
    started = true;
    chrome.tabs.onUpdated.removeListener(onUpdated);
    handOff(tabId).catch(() => adFail(tab.id, 'hand-off to TrendED failed'));
  };
  const onUpdated = (tabId, info) => {
    if (tabId === appId && info.status === 'complete') go(tabId);
  };
  chrome.tabs.onUpdated.addListener(onUpdated);
  const app = await chrome.tabs.create({
    url: `${APP_ORIGIN}/ads/capture?from=extension&h=${nonce}`,
  });
  appId = app.id;
  const now = await chrome.tabs.get(appId);
  if (now.status === 'complete' && (now.url || '').startsWith(APP_ORIGIN)) go(appId);
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) chrome.action.setBadgeText({ text: '', tabId: tab.id });
  return tab.id && isAdLibraryUrl(tab.url || '') ? sendAd(tab) : sendTab(tab);
});
