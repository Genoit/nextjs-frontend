import { ApiRequestError, fetchBlobWithAuth, fetchWithAuth, getApiBaseUrl } from './core';

// Meta Ad Library API. Mirrors fastapi-backend app/api/v1/ads.py.

const BASE = '/ads';

export type AdSort = 'run_time' | 'reach' | 'recent';

export interface AdOut {
  ad_archive_id: string;
  page_id: string;
  page_name: string;
  body: string | null;
  link_title: string | null;
  start_time: string;
  stop_time: string | null;
  run_days: number;
  long_running: boolean;
  platforms: string[];
  countries: string[];
  eu_reach: number | null;
  library_url: string;
  my_capture_ids: string[];
}

export interface SearchPage {
  items: AdOut[];
  next_cursor: string | null;
  refreshing: boolean;
}

export interface AdvertiserOut {
  page_id: string;
  name: string;
  active_ads: number;
  total_reach: number;
  oldest_active_start: string | null;
  following: boolean;
}

export interface AdvertiserPage {
  items: AdvertiserOut[];
  next_cursor: string | null;
}

export interface AdvertiserDetail extends AdvertiserOut {
  ads: AdOut[];
}

export interface CaptureOut {
  id: string;
  ad_archive_id: string;
  media_index: number;
  mime: string;
  size: number;
  url: string;
}

export interface AdSearchParams {
  q?: string;
  country?: string;
  active?: boolean;
  started_after?: string; // YYYY-MM-DD
  platform?: string;
  sort?: AdSort;
  cursor?: string;
}

export interface AdvertiserSearchParams {
  q?: string;
  country?: string;
  sort?: 'active' | 'reach';
  cursor?: string;
}

function query(params: object): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/**
 * Error code of a failed ads call. The API sends plain-string details (`"meta_busy"`),
 * which core.ts keeps as the message, so fall back to it when there is no code.
 */
export function adsErrorCode(err: unknown): string | undefined {
  return err instanceof ApiRequestError ? (err.code ?? err.message) : undefined;
}

export const adsApi = {
  search(params: AdSearchParams = {}): Promise<SearchPage> {
    return fetchWithAuth<SearchPage>(`${BASE}/search${query(params)}`);
  },

  advertisers(params: AdvertiserSearchParams = {}): Promise<AdvertiserPage> {
    return fetchWithAuth<AdvertiserPage>(`${BASE}/advertisers${query(params)}`);
  },

  advertiser(pageId: string): Promise<AdvertiserDetail> {
    return fetchWithAuth<AdvertiserDetail>(`${BASE}/advertisers/${encodeURIComponent(pageId)}`);
  },

  follow(pageId: string): Promise<AdvertiserOut> {
    return fetchWithAuth<AdvertiserOut>(
      `${BASE}/advertisers/${encodeURIComponent(pageId)}/follow`,
      { method: 'POST' },
    );
  },

  async unfollow(pageId: string): Promise<void> {
    await fetchWithAuth<void>(`${BASE}/advertisers/${encodeURIComponent(pageId)}/follow`, {
      method: 'DELETE',
    });
  },

  following(): Promise<AdvertiserOut[]> {
    return fetchWithAuth<AdvertiserOut[]>(`${BASE}/following`);
  },

  /** Ads the user captured, newest first. */
  captures(cursor?: string): Promise<SearchPage> {
    return fetchWithAuth<SearchPage>(`${BASE}/captures${query({ cursor })}`);
  },

  /** One capture = one ad; send all its media files together. */
  uploadCapture(adId: string, pageId: string, files: File[]): Promise<CaptureOut[]> {
    const form = new FormData();
    form.append('page_id', pageId);
    for (const f of files) form.append('files', f);
    return fetchWithAuth<CaptureOut[]>(`${BASE}/${encodeURIComponent(adId)}/captures`, {
      method: 'POST',
      body: form,
    });
  },

  async deleteCapture(adId: string): Promise<void> {
    await fetchWithAuth<void>(`${BASE}/${encodeURIComponent(adId)}/captures`, {
      method: 'DELETE',
    });
  },

  /** API URL of a capture file. It needs the Bearer token: use captureBlob for <img>/<video>. */
  captureFileUrl(id: string): string {
    return `${getApiBaseUrl()}${BASE}/captures/${encodeURIComponent(id)}/file`;
  },

  /** The capture file fetched with auth; make an object URL from it. */
  captureBlob(id: string): Promise<Blob> {
    return fetchBlobWithAuth(`${BASE}/captures/${encodeURIComponent(id)}/file`);
  },
};
