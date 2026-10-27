// Asset Pipeline (module 3) — mirrors backend AssetBoardResponse / ScenePlanResponse.
// Decimals arrive as strings.

export type AssetDecision = 'direct_reference' | 'processing' | 'no_reference';
export type SourceMode = 'auto' | 'force_original' | 'request_processing';
/** Derived for the UI by the backend: processing = submitting|submitted. */
export type ScenePlanStatus =
  | 'direct'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'fallback'
  | 'failed'
  | 'unknown'
  | 'no_reference';
export type ModelLicence = 'commercial' | 'non_commercial' | 'unknown' | 'internal';
export type AssetFallbackReason = 'fidelity_failed' | 'engine_error' | 'ambiguous_timeout';

export interface AssetFidelity {
  checked: boolean;
  passed: boolean | null;
  score: number | null;
  threshold: number | null;
  checker: string | null;
}

export interface ScenePlan {
  id: string;
  scene_id: string;
  scene_order: number;
  persuasive_role: string | null;
  visual_type: string | null;
  duration_seconds: number | string;
  decision: AssetDecision;
  reasons: string[];
  source_mode: SourceMode;
  status: ScenePlanStatus;
  used_source: 'original' | 'processed' | 'none';
  source_asset_id: string | null;
  final_asset_id: string | null;
  /** Job result, possibly rejected by the fidelity check. */
  result_asset_id: string | null;
  reference_asset_ids: string[];
  operation: string | null;
  provider: string | null;
  model: string | null;
  licence: ModelLicence | null;
  /** = job.is_mock; false for direct plans (no job). */
  is_heuristic: boolean;
  fidelity: AssetFidelity | null;
  fallback_reason: AssetFallbackReason | null;
  estimated_cost_usd: string | null;
  actual_cost_usd: string | null;
  error: string | null;
}

export interface AssetBoard {
  storyboard_id: string;
  /** True if any job of the board is mock. */
  is_heuristic: boolean;
  total_estimated_usd: string | null;
  total_actual_usd: string | null;
  plans: ScenePlan[];
}
