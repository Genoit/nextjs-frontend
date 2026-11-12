// Pure display rules of the store tracker. Mirrors fastapi-backend app/api/v1/stores.py.

export const STORES_ERROR_TEXT = Object.freeze({
  invalid_store_url: 'Enter a store address, like acme.com.',
  store_unreachable: "We couldn't reach this address. Check it and try again.",
  store_limit_reached:
    "Your plan's store limit is reached. Pause a store or upgrade to follow more.",
  store_not_found: "We couldn't find this store in your list.",
});

export function storesErrorText(code) {
  return STORES_ERROR_TEXT[code] ?? 'Something went wrong. Please try again.';
}

/**
 * What to show for a store's state. A paused follow wins over the store's own status.
 * @returns {{ tone: 'success' | 'warning' | 'danger' | 'neutral', label: string, hint: string | null }}
 */
export function storeState(status, paused) {
  if (paused)
    return {
      tone: 'neutral',
      label: 'Paused',
      hint: 'We no longer read this store for you. Its history stays here.',
    };
  switch (status) {
    case 'ok':
      return { tone: 'success', label: 'Tracking', hint: null };
    case 'pending':
      return {
        tone: 'warning',
        label: 'First reading',
        hint: 'We are reading this store for the first time. It takes a minute or two.',
      };
    case 'not_shopify':
      return {
        tone: 'danger',
        label: 'Not a Shopify store',
        hint: 'We can only track Shopify stores for now. This site does not look like one.',
      };
    case 'blocked':
      return {
        tone: 'danger',
        label: 'Store refuses robots',
        hint: 'This store does not let robots read it. We respect that and will check again in a week.',
      };
    default:
      return {
        tone: 'danger',
        label: 'Unreachable',
        hint: 'We could not read this store. We will try again later.',
      };
  }
}

/** True while a reading we are waiting for can still change what the page shows. */
export function isSettling(store) {
  return store.status === 'pending' && !store.paused;
}

export function money(amount, currency) {
  if (amount == null || amount === '') return '';
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  const fixed = n.toFixed(2);
  return currency ? `${fixed} ${currency}` : fixed;
}

function percent(oldValue, newValue) {
  const a = Number(oldValue);
  const b = Number(newValue);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0) return null;
  const p = Math.round(((b - a) / a) * 100);
  return p === 0 ? null : p;
}

/**
 * One change as a sentence, with a tone for its icon.
 * @param {{ kind: string, old: string | null, new: string | null }} change
 * @param {string | null} [currency]
 * @returns {{ text: string, tone: 'up' | 'down' | 'plus' | 'minus' | 'edit' }}
 */
export function changeText(change, currency = null) {
  const { kind, old: before, new: after } = change;
  switch (kind) {
    case 'product_added':
      return { text: 'New product', tone: 'plus' };
    case 'product_removed':
      return { text: 'Product removed', tone: 'minus' };
    case 'price': {
      const p = percent(before, after);
      const span = `${money(before, currency)} → ${money(after, currency)}`;
      if (p === null) return { text: `Price changed: ${span}`, tone: 'edit' };
      return p < 0
        ? { text: `Price down ${-p}%: ${span}`, tone: 'down' }
        : { text: `Price up ${p}%: ${span}`, tone: 'up' };
    }
    case 'compare_at':
      if (before == null && after != null)
        return { text: `Now shown as discounted from ${money(after, currency)}`, tone: 'down' };
      if (after == null)
        return { text: `Discount removed (was from ${money(before, currency)})`, tone: 'up' };
      return {
        text: `Crossed-out price: ${money(before, currency)} → ${money(after, currency)}`,
        tone: 'edit',
      };
    case 'title':
      return { text: `Renamed from “${before ?? ''}” to “${after ?? ''}”`, tone: 'edit' };
    case 'availability':
      return after === 'in stock'
        ? { text: 'Back in stock', tone: 'plus' }
        : { text: 'Sold out', tone: 'minus' };
    case 'theme':
      return { text: `Theme changed from ${before} to ${after}`, tone: 'edit' };
    case 'app_added':
      return { text: `Installed ${after}`, tone: 'plus' };
    case 'app_removed':
      return { text: `Removed ${before}`, tone: 'minus' };
    default:
      return { text: 'Change', tone: 'edit' };
  }
}

export const CHANGE_FILTERS = Object.freeze([
  ['', 'All changes'],
  ['product_added', 'New products'],
  ['product_removed', 'Removed products'],
  ['price', 'Prices'],
  ['compare_at', 'Discounts'],
  ['title', 'Titles'],
  ['availability', 'Stock'],
  ['theme', 'Theme'],
  ['app_added', 'Apps added'],
  ['app_removed', 'Apps removed'],
]);

/** "just now", "5 min ago", "3 h ago", "2 days ago"; null -> "Not read yet". */
export function readAgo(iso, now = Date.now()) {
  if (!iso) return 'Not read yet';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Not read yet';
  const min = Math.max(0, Math.floor((now - t) / 60000));
  if (min < 1) return 'Read just now';
  if (min < 60) return `Read ${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 48) return `Read ${h} h ago`;
  return `Read ${Math.floor(h / 24)} days ago`;
}

export function countLabel(n, one, many) {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
}
