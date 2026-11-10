import { ApiRequestError, fetchWithAuth } from './core';

// ============================================
// Shopify Connect API. Mirrors fastapi-backend app/api/v1/shopify.py.
// ============================================

const BASE = '/shopify';

export type Rounding = '.99' | '.95' | 'none';
export type SyncState = 'pending_review' | 'syncing' | 'synced' | 'error' | 'conflict';

export interface PricingRule {
  multiplier: string | number;
  rounding: Rounding;
  compare_at_pct: string | number | null;
}

export interface ShopifyStore {
  id: string;
  shop_domain: string;
  currency: string | null;
  primary_locale: string | null;
  status: string;
  multiplier: string;
  rounding: Rounding;
  compare_at_pct: string | null;
  created_at: string;
}

export interface VariantPricePreview {
  variant_key: string;
  cost: string;
  cost_currency: string;
  converted_cost: string;
  price: string;
  compare_at: string | null;
  margin: string;
  fx_rate: string;
  fx_date: string;
}

export type PreviewError =
  | { error: 'missing_purchase_cost'; variants: string[] }
  | { error: 'fx_unavailable'; currency: string };

export type StorePreview = VariantPricePreview[] | PreviewError;

export interface ListingView {
  title: string | null;
  description: string | null;
  language: string;
  /** `default` plus one entry per variant id. */
  purchase_costs: Record<string, string | null>;
  currency: string | null;
  missing_costs: string[];
  /** A cost is saved but its currency is not, so prices cannot be computed. */
  missing_currency: boolean;
  pricing_override: PricingRule | null;
  /** Keyed by store id. */
  previews: Record<string, StorePreview>;
}

export interface ListingSave {
  title: string;
  description: string;
  language: string;
  purchase_cost: string | number | null;
  purchase_cost_currency: string | null;
  variant_costs?: Record<string, string | number | null>;
  pricing_override: PricingRule | null;
}

export interface FieldDiff {
  field: string;
  trended: unknown;
  shopify: unknown;
}

export interface ShopifyListing {
  id: string;
  store_id: string;
  shop_domain: string;
  state: SyncState;
  last_error: string | null;
  /** `fixed` after keeping Shopify's price in a conflict, until the rule is turned back on. */
  price_source: 'rule' | 'override' | 'fixed';
  /** A push waits while its store is not active. */
  store_status: ShopifyStore['status'];
  /** Only filled for listings in conflict; null when Shopify could not be read. */
  diffs: FieldDiff[] | null;
}

export interface ShopifyAlert {
  listing_id: string;
  product_id: string;
  product_title: string;
  shop_domain: string;
  state: 'conflict' | 'error';
  last_error: string | null;
}

export type ResolveChoice = 'trended' | 'shopify';

export const shopifyApi = {
  /** Shopify OAuth URL to send the merchant to. */
  connect(shop: string): Promise<{ url: string }> {
    return fetchWithAuth<{ url: string }>(`${BASE}/connect`, {
      method: 'POST',
      body: JSON.stringify({ shop }),
    });
  },

  /** Finishes an install from the one-time ticket in the callback redirect. */
  confirmInstall(ticket: string): Promise<ShopifyStore> {
    return fetchWithAuth<ShopifyStore>(`${BASE}/installs/confirm`, {
      method: 'POST',
      body: JSON.stringify({ ticket }),
    });
  },

  stores(): Promise<ShopifyStore[]> {
    return fetchWithAuth<ShopifyStore[]>(`${BASE}/stores`, { method: 'GET' });
  },

  updateStore(id: string, rule: PricingRule): Promise<ShopifyStore> {
    return fetchWithAuth<ShopifyStore>(`${BASE}/stores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(rule),
    });
  },

  async disconnect(id: string): Promise<void> {
    await fetchWithAuth<void>(`${BASE}/stores/${id}`, { method: 'DELETE' });
  },

  listing(productId: string): Promise<ListingView> {
    return fetchWithAuth<ListingView>(`${BASE}/products/${productId}/listing`, { method: 'GET' });
  },

  generateCopy(productId: string, language?: string): Promise<ListingView> {
    return fetchWithAuth<ListingView>(`${BASE}/products/${productId}/listing/generate`, {
      method: 'POST',
      body: JSON.stringify({ language: language ?? null }),
    });
  },

  saveListing(productId: string, body: ListingSave): Promise<ListingView> {
    return fetchWithAuth<ListingView>(`${BASE}/products/${productId}/listing`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  send(productId: string, storeIds: string[]): Promise<ShopifyListing[]> {
    return fetchWithAuth<ShopifyListing[]>(`${BASE}/products/${productId}/send`, {
      method: 'POST',
      body: JSON.stringify({ store_ids: storeIds }),
    });
  },

  /** `diffs: false` skips the live Shopify read of conflicts (for polling). */
  listings(productId: string, diffs = true): Promise<ShopifyListing[]> {
    return fetchWithAuth<ShopifyListing[]>(
      `${BASE}/products/${productId}/listings${diffs ? '' : '?diffs=false'}`,
      { method: 'GET' },
    );
  },

  /** `limit` is null when plan limits are not enforced. */
  storeLimit(): Promise<{ limit: number | null; used: number }> {
    return fetchWithAuth(`${BASE}/store-limit`, { method: 'GET' });
  },

  /** `choices` maps a diff field to the side that wins. */
  resolve(listingId: string, choices: Record<string, ResolveChoice>): Promise<ShopifyListing> {
    return fetchWithAuth<ShopifyListing>(`${BASE}/listings/${listingId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ choices }),
    });
  },

  useRule(listingId: string): Promise<ShopifyListing> {
    return fetchWithAuth<ShopifyListing>(`${BASE}/listings/${listingId}/use-rule`, {
      method: 'POST',
    });
  },

  alerts(): Promise<ShopifyAlert[]> {
    return fetchWithAuth<ShopifyAlert[]>(`${BASE}/alerts`, { method: 'GET' });
  },
};

/** The backend's error code: a `detail` string, or `detail.error` for structured 422s. */
export function shopifyErrorCode(err: unknown): string | undefined {
  if (!(err instanceof ApiRequestError)) return undefined;
  const detail = (err.data as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object' && 'error' in detail) {
    return String((detail as { error: unknown }).error);
  }
  return undefined;
}
