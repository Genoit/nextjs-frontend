import { fetchWithAuth, getApiBaseUrl } from './core';
import {
  CreativeConfig,
  CreativeConfigCreatePayload,
  CreativeStrategy,
  CreativeStrategyGeneratePayload,
  Storyboard,
  StoryboardUpdatePayload,
  StoryboardVersionSummary,
  StrategyCost,
  VideoGenerationJob,
  VideoGenerationJobCreatePayload,
  ModelCapabilitySummary,
  ComplianceReport,
  TrainingConsent,
  AdPerformanceMetric,
  DatasetManifest,
  ExportAspectRatio,
  MusicTrack,
  VideoExport,
} from '../types/creative';
import { configOrNull } from '../creative-rules.mjs';

// ============================================
// Creative Ad Engine API Client
// ============================================

const CREATIVE_BASE_PATH = '/creative';

export const creativeApi = {
  /**
   * Get the creative configuration of a product. The API answers 200 `null` when none exists.
   */
  async getCreativeConfig(productId: string): Promise<CreativeConfig | null> {
    const url = `${CREATIVE_BASE_PATH}/products/${productId}/creative-config`;
    return configOrNull(await fetchWithAuth<CreativeConfig | null>(url, { method: 'GET' }));
  },

  /**
   * Create or update the creative configuration (objective, audience, duration, platform, etc.)
   */
  async saveCreativeConfig(payload: CreativeConfigCreatePayload): Promise<CreativeConfig> {
    const url = `${CREATIVE_BASE_PATH}/creative-config`;
    return fetchWithAuth<CreativeConfig>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Generate brief + 2-5 angles (LLM or deterministic engine). 409 if no product analysis.
   */
  async generateStrategy(payload: CreativeStrategyGeneratePayload): Promise<CreativeStrategy> {
    const url = `${CREATIVE_BASE_PATH}/strategy/generate`;
    return fetchWithAuth<CreativeStrategy>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch current creative strategy for a product
   */
  async getStrategy(productId: string): Promise<CreativeStrategy> {
    const url = `${CREATIVE_BASE_PATH}/products/${productId}/strategy`;
    return fetchWithAuth<CreativeStrategy>(url, { method: 'GET' });
  },

  /**
   * Latest strategy of a product, or null when none exists (the API answers 200 `null`).
   */
  async getLatestStrategy(productId: string): Promise<CreativeStrategy | null> {
    const url = `${CREATIVE_BASE_PATH}/products/${productId}/strategy`;
    return configOrNull(await fetchWithAuth<CreativeStrategy | null>(url, { method: 'GET' }));
  },

  /**
   * Choose the angle the storyboard will be generated from
   */
  async chooseAngle(strategyId: string, angleId: string): Promise<CreativeStrategy> {
    const url = `${CREATIVE_BASE_PATH}/strategy/${strategyId}/choose-angle`;
    return fetchWithAuth<CreativeStrategy>(url, {
      method: 'POST',
      body: JSON.stringify({ angle_id: angleId }),
    });
  },

  /**
   * Generate a storyboard version for the chosen angle (force=true: new version)
   */
  async generateStoryboard(strategyId: string, force = false): Promise<Storyboard> {
    const url = `${CREATIVE_BASE_PATH}/strategy/${strategyId}/storyboard`;
    return fetchWithAuth<Storyboard>(url, {
      method: 'POST',
      body: JSON.stringify({ force }),
    });
  },

  /**
   * List storyboard versions of a strategy
   */
  async listStoryboards(strategyId: string): Promise<StoryboardVersionSummary[]> {
    const url = `${CREATIVE_BASE_PATH}/strategy/${strategyId}/storyboards`;
    return fetchWithAuth<StoryboardVersionSummary[]>(url, { method: 'GET' });
  },

  /**
   * Get one storyboard version (spec + scenes + violations + costs)
   */
  async getStoryboard(storyboardId: string): Promise<Storyboard> {
    const url = `${CREATIVE_BASE_PATH}/storyboard/${storyboardId}`;
    return fetchWithAuth<Storyboard>(url, { method: 'GET' });
  },

  /**
   * Save edits: the API creates a new version (409 if this version is accepted)
   */
  async updateStoryboard(
    storyboardId: string,
    payload: StoryboardUpdatePayload,
  ): Promise<Storyboard> {
    const url = `${CREATIVE_BASE_PATH}/storyboard/${storyboardId}`;
    return fetchWithAuth<Storyboard>(url, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Accept a storyboard version (409 if blocking violations or not the latest)
   */
  async acceptStoryboard(storyboardId: string): Promise<Storyboard> {
    const url = `${CREATIVE_BASE_PATH}/storyboard/${storyboardId}/accept`;
    return fetchWithAuth<Storyboard>(url, { method: 'POST' });
  },

  /**
   * Cumulated cost (analysis + strategy + every storyboard version) of a strategy
   */
  async getStrategyCost(strategyId: string): Promise<StrategyCost> {
    const url = `${CREATIVE_BASE_PATH}/strategy/${strategyId}/cost`;
    return fetchWithAuth<StrategyCost>(url, { method: 'GET' });
  },

  /**
   * Launch asynchronous video generation job
   */
  async generateVideo(payload: VideoGenerationJobCreatePayload): Promise<VideoGenerationJob> {
    const url = `${CREATIVE_BASE_PATH}/video/generate`;
    return fetchWithAuth<VideoGenerationJob>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Poll video generation job status, progress percentage, steps, and quality report
   */
  async getVideoJob(jobId: string): Promise<VideoGenerationJob> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs/${jobId}`;
    return fetchWithAuth<VideoGenerationJob>(url, { method: 'GET' });
  },

  /**
   * Cancel an ongoing video generation job
   */
  async cancelVideoJob(jobId: string): Promise<VideoGenerationJob> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs/${jobId}/cancel`;
    return fetchWithAuth<VideoGenerationJob>(url, { method: 'POST' });
  },

  /**
   * Retry or resume a failed or incomplete video generation job
   */
  async retryJob(jobId: string): Promise<VideoGenerationJob> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs/${jobId}/retry`;
    return fetchWithAuth<VideoGenerationJob>(url, { method: 'POST' });
  },

  /**
   * Re-render one shot whose previous attempt may already have been billed (409 without
   * confirm_cost, 409 over budget).
   */
  async rerenderShot(
    jobId: string,
    shotId: string,
    body: { confirm_cost: true; provider_name?: string },
  ): Promise<unknown> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs/${jobId}/shots/${shotId}/rerender`;
    return fetchWithAuth<unknown>(url, { method: 'POST', body: JSON.stringify(body) });
  },

  /**
   * Accept a quality_review shot despite its failed checks (409 unless the shot is in
   * quality_review). The override is recorded as a human label for threshold calibration.
   */
  async acceptShot(jobId: string, shotId: string): Promise<VideoGenerationJob> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs/${jobId}/shots/${shotId}/accept`;
    return fetchWithAuth<VideoGenerationJob>(url, {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
  },

  /** Past video jobs of a product, newest first (history). */
  async listVideoJobs(productId: string): Promise<VideoGenerationJob[]> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs?product_id=${encodeURIComponent(productId)}`;
    return fetchWithAuth<VideoGenerationJob[]>(url, { method: 'GET' });
  },

  /** Every format of a completed job's final video (the primary export included). */
  async listExports(jobId: string): Promise<VideoExport[]> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs/${jobId}/exports`;
    return fetchWithAuth<VideoExport[]>(url, { method: 'GET' });
  },

  /** Build another format on demand (202; idempotent per ratio, EDL version and track). */
  async createExport(
    jobId: string,
    body: { aspect_ratio: ExportAspectRatio; track_id?: string },
  ): Promise<VideoExport> {
    const url = `${CREATIVE_BASE_PATH}/video/jobs/${jobId}/exports`;
    return fetchWithAuth<VideoExport>(url, { method: 'POST', body: JSON.stringify(body) });
  },

  /** Royalty-free library + the user's own uploads. */
  async listMusicTracks(): Promise<MusicTrack[]> {
    return fetchWithAuth<MusicTrack[]>(`${CREATIVE_BASE_PATH}/music/tracks`, { method: 'GET' });
  },

  /** Upload a track (mp3/wav/m4a); the user must confirm holding the rights. */
  async uploadMusicTrack(file: File, title: string, moods: string[]): Promise<MusicTrack> {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('mood', moods.join(','));
    form.append('rights_confirmed', 'true');
    return fetchWithAuth<MusicTrack>(`${CREATIVE_BASE_PATH}/music/tracks`, {
      method: 'POST',
      body: form,
    });
  },

  async deleteMusicTrack(trackId: string): Promise<void> {
    const url = `${CREATIVE_BASE_PATH}/music/tracks/${trackId}`;
    await fetchWithAuth<void>(url, { method: 'DELETE' });
  },

  /**
   * List available AI video providers and hardware capability summaries
   */
  async getProviders(): Promise<ModelCapabilitySummary[]> {
    const url = `${CREATIVE_BASE_PATH}/providers`;
    return fetchWithAuth<ModelCapabilitySummary[]>(url, { method: 'GET' });
  },

  /**
   * Check advertising legal and platform compliance (TikTok, Meta, Google, etc.)
   */
  async checkCompliance(data: {
    product_id: string;
    strategy_id?: string;
    platform?: string;
    script_text?: string;
    claims_to_verify?: string[];
  }): Promise<ComplianceReport> {
    const url = `${CREATIVE_BASE_PATH}/compliance/check`;
    return fetchWithAuth<ComplianceReport>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Record or revoke training consent for future AI models fine-tuning
   */
  async recordConsent(data: {
    consent_type?: string;
    granted: boolean;
    consent_scope?: string[];
    retention_days?: number;
    ip_hash?: string;
    notes?: string;
  }): Promise<TrainingConsent> {
    const url = `${CREATIVE_BASE_PATH}/consent`;
    return fetchWithAuth<TrainingConsent>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get user training consent history
   */
  async getConsentHistory(): Promise<TrainingConsent[]> {
    const url = `${CREATIVE_BASE_PATH}/consent`;
    return fetchWithAuth<TrainingConsent[]>(url, { method: 'GET' });
  },

  /**
   * Fetch GDPR-compliant training dataset manifest
   */
  async getTrainingManifest(minQualityScore?: number): Promise<DatasetManifest> {
    const query = minQualityScore ? `?min_quality_score=${minQualityScore}` : '';
    const url = `${CREATIVE_BASE_PATH}/training/manifest${query}`;
    return fetchWithAuth<DatasetManifest>(url, { method: 'GET' });
  },

  /**
   * Record observed commercial performance metrics (impressions, clicks, conversions, spend, sales)
   */
  async recordMetrics(data: {
    job_id: string;
    platform: string;
    campaign_id?: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend?: number | string;
    revenue?: number | string;
    ctr?: number;
    roas?: number;
  }): Promise<AdPerformanceMetric> {
    const url = `${CREATIVE_BASE_PATH}/metrics`;
    return fetchWithAuth<AdPerformanceMetric>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get direct download URL for a generated video asset (MP4)
   */
  getAssetDownloadUrl(assetId: string): string {
    return `${getApiBaseUrl()}${this.assetDownloadPath(assetId)}`;
  },

  /** Endpoint of a generated asset (MP4), for fetchBlobWithAuth: it needs the Bearer token. */
  assetDownloadPath(assetId: string): string {
    return `${CREATIVE_BASE_PATH}/assets/${assetId}/download`;
  },
};
