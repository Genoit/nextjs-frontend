import { fetchWithAuth } from './core';
import type { AdOut } from './ads';

// Store tracker API. Mirrors fastapi-backend app/api/v1/stores.py.

const BASE = '/stores';

export type StoreStatus = 'pending' | 'ok' | 'not_shopify' | 'blocked' | 'unreachable';

export interface StoreOut {
  id: string;
  domain: string;
  title: string | null;
  status: StoreStatus;
  currency: string | null;
  theme: string | null;
  product_count: number;
  last_fetched_at: string | null;
  paused: boolean;
  followed_at: string;
  changes_7d: number;
}

export interface DayPoint {
  day: string; // YYYY-MM-DD
  product_count: number;
  added: number;
  removed: number;
}

export interface StoreDetail extends StoreOut {
  pixels: string[];
  apps: string[];
  series: DayPoint[];
  ads_count: number;
}

export interface StoreProduct {
  id: string;
  handle: string;
  title: string | null;
  image_url: string | null;
  url: string;
  price: string | null;
  compare_at_price: string | null;
  currency: string | null;
  available: boolean | null;
  first_seen_at: string;
  removed_at: string | null;
}

export interface StoreChange {
  id: string;
  kind: string;
  old: string | null;
  new: string | null;
  created_at: string;
  product: StoreProduct | null;
}

export interface ChangePage {
  items: StoreChange[];
  next_offset: number | null;
}

export interface ProductPage {
  items: StoreProduct[];
  next_offset: number | null;
}

export type ProductSort = 'recent' | 'price_asc' | 'price_desc';

const one = (id: string) => `${BASE}/${encodeURIComponent(id)}`;

export const storesApi = {
  list(): Promise<StoreOut[]> {
    return fetchWithAuth<StoreOut[]>(BASE);
  },

  follow(url: string): Promise<StoreOut> {
    return fetchWithAuth<StoreOut>(BASE, { method: 'POST', body: JSON.stringify({ url }) });
  },

  get(id: string): Promise<StoreDetail> {
    return fetchWithAuth<StoreDetail>(one(id));
  },

  changes(id: string, kind = '', offset = 0): Promise<ChangePage> {
    const qs = new URLSearchParams({ offset: String(offset) });
    if (kind) qs.set('kind', kind);
    return fetchWithAuth<ChangePage>(`${one(id)}/changes?${qs}`);
  },

  products(id: string, sort: ProductSort = 'recent', offset = 0): Promise<ProductPage> {
    const qs = new URLSearchParams({ sort, offset: String(offset) });
    return fetchWithAuth<ProductPage>(`${one(id)}/products?${qs}`);
  },

  ads(id: string): Promise<{ items: AdOut[] }> {
    return fetchWithAuth<{ items: AdOut[] }>(`${one(id)}/ads`);
  },

  pause(id: string): Promise<StoreOut> {
    return fetchWithAuth<StoreOut>(`${one(id)}/pause`, { method: 'POST' });
  },

  resume(id: string): Promise<StoreOut> {
    return fetchWithAuth<StoreOut>(`${one(id)}/resume`, { method: 'POST' });
  },

  async unfollow(id: string): Promise<void> {
    await fetchWithAuth<void>(one(id), { method: 'DELETE' });
  },
};
