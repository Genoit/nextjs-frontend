import { fetchBlobWithAuth, fetchWithAuth } from './core';
import { AssetBoard, SourceMode } from '../types/assets';
import { configOrNull } from '../creative-rules.mjs';

// ============================================
// Asset Pipeline API Client (module 3)
// ============================================

const CREATIVE_BASE_PATH = '/creative';

export const assetsApi = {
  /** Asset board of a storyboard. The API answers 200 `null` before any plan. */
  async getBoard(storyboardId: string): Promise<AssetBoard | null> {
    const url = `${CREATIVE_BASE_PATH}/storyboard/${storyboardId}/asset-plan`;
    return configOrNull(await fetchWithAuth<AssetBoard | null>(url, { method: 'GET' }));
  },

  /** Plan (and run) the visuals of an accepted storyboard. force=true re-runs failed/unknown jobs. */
  async prepare(storyboardId: string, force = false): Promise<AssetBoard> {
    const url = `${CREATIVE_BASE_PATH}/storyboard/${storyboardId}/asset-plan`;
    return fetchWithAuth<AssetBoard>(url, { method: 'POST', body: JSON.stringify({ force }) });
  },

  /** Change the source of one plan; answers the whole board (409 while its job runs). */
  async setSourceMode(planId: string, sourceMode: SourceMode): Promise<AssetBoard> {
    const url = `${CREATIVE_BASE_PATH}/asset-plan/${planId}`;
    return fetchWithAuth<AssetBoard>(url, {
      method: 'PATCH',
      body: JSON.stringify({ source_mode: sourceMode }),
    });
  },

  /** Endpoint of an owner-only media asset (image or clip). */
  mediaPath(assetId: string): string {
    return `${CREATIVE_BASE_PATH}/media-assets/${assetId}`;
  },

  /** Owner-only image bytes: needs the Bearer token, so it cannot be an <img src> URL. */
  async getMediaBlob(assetId: string): Promise<Blob> {
    return fetchBlobWithAuth(this.mediaPath(assetId));
  },
};
