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

chrome.action.onClicked.addListener(sendTab);
