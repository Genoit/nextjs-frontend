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
