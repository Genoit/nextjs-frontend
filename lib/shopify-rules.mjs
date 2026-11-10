// Display rules for the Shopify connection. Plain ESM + JSDoc so `node --test` imports it.

/** @type {Record<string, string>} */
export const SYNC_LABEL = {
  pending_review: 'Needs review',
  syncing: 'Syncing',
  synced: 'Synced',
  error: 'Error',
  conflict: 'Conflict',
};

/**
 * "1 of 3 stores"; a limit of 0 means the plan cannot connect a store.
 * @param {number} used
 * @param {number} limit
 */
export function storeLimitText(used, limit) {
  if (limit <= 0) return 'Upgrade to connect a store';
  return `${used} of ${limit} store${limit === 1 ? '' : 's'}`;
}

/**
 * Human label for a conflict diff field (`title`, `price:<k>`, ...).
 * @param {string} field
 */
export function diffLabel(field) {
  if (field === 'title') return 'Title';
  if (field === 'description') return 'Description';
  if (field.startsWith('unmanaged_variant:')) return 'Added in Shopify, not managed by TrendED';
  const i = field.indexOf(':');
  const key = field.slice(i + 1);
  const kind = field.slice(0, i);
  if (kind === 'price') return `Price (${key})`;
  if (kind === 'compare_at') return `Compare-at price (${key})`;
  if (kind === 'options') return `Options (${key})`;
  return field;
}

/**
 * A product can be sent when every cost is known and no store preview failed.
 * @param {{missing_costs?: string[], previews?: Record<string, unknown>}} listing
 */
export function canSend(listing) {
  if ((listing.missing_costs ?? []).length > 0) return false;
  return !Object.values(listing.previews ?? {}).some(
    (p) => p !== null && typeof p === 'object' && !Array.isArray(p) && 'error' in p,
  );
}

/** @type {Record<string, string>} */
export const STORE_STATUS_LABEL = {
  active: 'Active',
  paused_over_limit: 'Paused: over your plan limit',
  uninstalled: 'Uninstalled in Shopify',
};

/** Error codes the backend callback may name (`reason`); anything else reads as a failed install. */
const CALLBACK_REASONS = ['store_limit_reached', 'shop_already_connected'];

/**
 * The Shopify callback in a query string. Any `install` or `shopify` param counts, so the
 * caller strips it; only a well-formed confirm carries a ticket to redeem.
 * @param {string} search
 * @returns {{kind: 'confirm', ticket: string} | {kind: 'error', reason: string} | null}
 */
export function readShopifyCallback(search) {
  const q = new URLSearchParams(search);
  if (!q.has('shopify') && !q.has('install')) return null;
  const ticket = q.get('install');
  if (q.get('shopify') === 'confirm' && ticket) return { kind: 'confirm', ticket };
  const reason = q.get('reason') ?? '';
  return { kind: 'error', reason: CALLBACK_REASONS.includes(reason) ? reason : 'callback_failed' };
}

/**
 * A same-site path without the Shopify callback params, so a login redirect never carries a ticket.
 * @param {string} path
 */
export function stripInstallParams(path) {
  const url = new URL(path, 'http://x');
  if (!url.searchParams.has('install') && !url.searchParams.has('shopify')) return path;
  url.searchParams.delete('install');
  url.searchParams.delete('shopify');
  return url.pathname + url.search + url.hash;
}

/** @type {Record<string, string>} */
const ERROR_TEXT = {
  invalid_shop: 'Enter your store address, like my-store.myshopify.com.',
  install_expired: 'This install link expired. Connect the store again.',
  install_user_mismatch:
    'This install was started from another TrendED account. Log in with that account, then connect the store again.',
  shop_already_connected: 'This store is already connected to another TrendED account.',
  store_limit_reached: 'Your plan’s store limit is reached. Upgrade or disconnect a store first.',
  shopify_unavailable: 'Shopify did not answer. Try again in a minute.',
  callback_failed: 'Shopify did not finish the install. Connect the store again.',
  store_not_active: 'This store is paused or uninstalled, so nothing can be sent to it.',
  analysis_required: 'Analyse the product first, then write the copy.',
  missing_purchase_cost: 'Save a purchase cost for every variant first.',
  missing_currency: 'Choose the currency of the purchase cost first.',
  fx_unavailable: 'No exchange rate is available for this currency yet.',
  payload_error: 'This product cannot be built as a Shopify product yet.',
  not_in_conflict: 'This listing is no longer in conflict. Reload the page.',
  deleted_in_shopify: 'The product was deleted in Shopify. Send it again to re-create it.',
  options_shopify_unsupported: 'Shopify’s options cannot be kept yet. Keep TrendED’s instead.',
  variant_missing_in_shopify: 'A variant was deleted in Shopify. Keep TrendED’s price for it.',
  missing_choices: 'Pick a side for every field.',
};

/**
 * English text for a backend error code (the `detail` string, or `detail.error`).
 * @param {string | undefined | null} code
 */
export function shopifyErrorText(code) {
  return (code && ERROR_TEXT[code]) || 'Something went wrong. Try again.';
}

/**
 * Sides the user may pick for a conflict field. Options can only keep TrendED (the backend
 * refuses `shopify`); variants added in Shopify are information only.
 * @param {string} field
 * @returns {('trended' | 'shopify')[]}
 */
export function conflictChoices(field) {
  if (field.startsWith('unmanaged_variant:')) return [];
  if (field.startsWith('options:')) return ['trended'];
  return ['trended', 'shopify'];
}

/**
 * Why "Validate and send" is disabled, or null when it can run.
 * @param {{title?: string | null, missing_costs?: string[], missing_currency?: boolean, previews?: Record<string, any>}} listing
 * @param {{dirty: boolean, picked: string[]}} state
 */
export function sendBlocker(listing, { dirty, picked }) {
  if (dirty) return 'Save your changes first.';
  if (!listing.title?.trim()) return 'Write a title first.';
  if ((listing.missing_costs ?? []).length > 0)
    return 'Save a purchase cost for every variant first.';
  if (listing.missing_currency) return ERROR_TEXT.missing_currency;
  if (picked.length === 0) return 'Pick at least one store.';
  const previews = Object.fromEntries(picked.map((id) => [id, listing.previews?.[id]]));
  if (canSend({ missing_costs: [], previews })) return null;
  const failed = Object.values(previews).find((p) => p && !Array.isArray(p) && 'error' in p);
  return failed?.error === 'fx_unavailable'
    ? `No exchange rate for ${failed.currency} yet, so prices cannot be computed.`
    : 'Save a purchase cost for every variant first.';
}
