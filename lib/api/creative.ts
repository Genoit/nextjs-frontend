import { fetchWithAuth, getApiBaseUrl } from './core';
import {
  UGCSetup,
  UGCSetupCreatePayload,
  UGCSetupUpdatePayload,
  CreativeStrategy,
  CreativeStrategyGeneratePayload,
  Storyboard,
  StoryboardUpdatePayload,
  VideoGenerationJob,
  VideoGenerationJobCreatePayload,
  ModelCapabilitySummary,
  ComplianceReport,
  TrainingConsent,
  AdPerformanceMetric,
  DatasetManifest,
} from '../types/creative';

// ============================================
// Creative Ad Engine API Client
// ============================================

const CREATIVE_BASE_PATH = '/creative';

export const creativeApi = {
  /**
   * Get UGC Setup configuration for a product
   */
  async getUGCSetup(productId: string): Promise<UGCSetup> {
    const url = `${CREATIVE_BASE_PATH}/products/${productId}/ugc-setup`;
    return fetchWithAuth<UGCSetup>(url, { method: 'GET' });
  },

  /**
   * Create or update UGC Setup parameters (objective, audience, angle, duration, platform, etc.)
   */
  async saveUGCSetup(payload: UGCSetupCreatePayload): Promise<UGCSetup> {
    const url = `${CREATIVE_BASE_PATH}/ugc-setup`;
    return fetchWithAuth<UGCSetup>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Partially update existing UGC Setup
   */
  async updateUGCSetup(setupId: string, payload: UGCSetupUpdatePayload): Promise<UGCSetup> {
    const url = `${CREATIVE_BASE_PATH}/ugc-setup/${setupId}`;
    return fetchWithAuth<UGCSetup>(url, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Generate a persuasive creative strategy via LLM / Deterministic engine
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
   * Mark a creative strategy as approved/validated by user
   */
  async validateStrategy(strategyId: string): Promise<CreativeStrategy> {
    const url = `${CREATIVE_BASE_PATH}/strategy/${strategyId}/validate`;
    return fetchWithAuth<CreativeStrategy>(url, { method: 'POST' });
  },

  /**
   * Generate storyboard scenes from an approved strategy
   */
  async generateStoryboard(strategyId: string): Promise<Storyboard> {
    const url = `${CREATIVE_BASE_PATH}/strategy/${strategyId}/storyboard`;
    return fetchWithAuth<Storyboard>(url, { method: 'POST' });
  },

  /**
   * Get storyboard for a strategy
   */
  async getStoryboard(strategyId: string): Promise<Storyboard> {
    const url = `${CREATIVE_BASE_PATH}/strategy/${strategyId}/storyboard`;
    return fetchWithAuth<Storyboard>(url, { method: 'GET' });
  },

  /**
   * Update storyboard (title, status, or edited scene prompts & timings)
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
    return `${getApiBaseUrl()}${CREATIVE_BASE_PATH}/assets/${assetId}/download`;
  },
};
