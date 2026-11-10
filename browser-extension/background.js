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
  let box = document.body;
  const label = [...document.querySelectorAll('span, div')].find(
    (e) => e.children.length === 0 && (e.textContent || '').includes(ID_TEXT),
  );
  for (let el = label; el && el !== document.body; el = el.parentElement) {
    if (el.querySelector(MEDIA)) {
      box = el;
      break;
    }
  }
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

// Runs in the app tab. op: start | chunk | done. Same key, store and event as lib/extension-capture.ts.
function writeHandoff(op, a) {
  const KEY = 'trended:ad-capture';
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('trended', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('handoff');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const store = db.transaction('handoff', 'readwrite').objectStore('handoff');
      const get = store.get(KEY);
      get.onsuccess = () => {
        let r = get.result;
        if (op === 'start') r = { adId: a.adId, pageId: a.pageId, complete: false, files: [] };
        else if (op === 'chunk') {
          let f = r.files[a.file];
          if (!f) f = r.files[a.file] = { name: a.name, type: a.type, chunks: [] };
          f.chunks.push(a.chunk);
        } else r.complete = true;
        store.put(r, KEY).onsuccess = () => {
          db.close();
          if (op === 'done') window.dispatchEvent(new Event('trended:ad-capture'));
          resolve();
        };
      };
    };
  });
}

async function sendAd(tab) {
  const [{ result: page }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: readAdPage,
  });
  if (!page || page.error || !page.pageId) return adFail(tab.id, "couldn't read this ad");
  const files = [];
  let total = 0;
  for (const m of page.media) {
    try {
      const res = await fetch(m.url);
      if (!res.ok) continue;
      const bytes = new Uint8Array(await res.arrayBuffer());
      const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!ALLOWED.includes(type) || total + bytes.length > MAX_TOTAL) continue;
      total += bytes.length;
      const ext = type.split('/')[1].replace('jpeg', 'jpg');
      files.push({ name: `ad-${page.adId}-${files.length + 1}.${ext}`, type, bytes });
    } catch {
      /* unreachable media: skip */
    }
  }
  if (!files.length) return adFail(tab.id, 'no usable media found in this ad');
  const app = await chrome.tabs.create({ url: `${APP_ORIGIN}/ads/capture?from=extension` });
  chrome.tabs.onUpdated.addListener(function handOff(tabId, info) {
    if (tabId !== app.id || info.status !== 'complete') return;
    chrome.tabs.onUpdated.removeListener(handOff);
    const run = (op, args) =>
      chrome.scripting.executeScript({ target: { tabId }, func: writeHandoff, args: [op, args] });
    (async () => {
      await run('start', { adId: page.adId, pageId: page.pageId });
      for (const [i, f] of files.entries()) {
        for (const chunk of splitBase64(f.bytes)) {
          await run('chunk', { file: i, name: f.name, type: f.type, chunk });
        }
      }
      await run('done', {});
    })().catch(() => adFail(tab.id, 'hand-off to TrendED failed'));
  });
}

chrome.action.onClicked.addListener((tab) =>
  tab.id && isAdLibraryUrl(tab.url || '') ? sendAd(tab) : sendTab(tab),
);
