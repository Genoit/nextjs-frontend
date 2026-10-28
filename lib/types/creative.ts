export type CampaignObjective = 'sales' | 'traffic' | 'awareness' | 'retargeting';
export type VideoStyle = 'hybrid' | 'ugc_natural' | 'cinematic';
export type TargetPlatform = 'tiktok' | 'instagram_reels' | 'facebook' | 'youtube';
export type NarrativeFunction =
  'hook' | 'context' | 'reveal' | 'demonstration' | 'resolution' | 'cta';
export type SceneVisualType = 'human' | 'product' | 'hybrid';
export type StoryboardStatus = 'draft' | 'validated' | 'generating' | 'completed' | 'failed';
export type JobStatus =
  | 'pending'
  | 'processing'
  | 'rendering'
  | 'assembling'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled';
export type AssetType = 'final_video' | 'scene_clip' | 'audio_voiceover' | 'thumbnail';

export type CreativeConceptType =
  | 'founder_story'
  | 'cinematic_storytelling'
  | 'sensory_focus'
  | 'product_demo'
  | 'problem_solution'
  | 'before_after'
  | 'social_proof'
  | 'unboxing'
  | 'comparative_challenge'
  | 'myth_busting';

export type VisualFeasibilityStatus = 'feasible' | 'risky' | 'simplified_fallback';
export type ComplianceStatus = 'passed' | 'warning' | 'rejected';

export interface ProductFact {
  attribute: string;
  value: string;
  source?: string;
}

export interface ProductBenefit {
  benefit: string;
  source_context?: string;
}

export interface CommercialProof {
  proof_type: string;
  value: string;
  verified: boolean;
}

export interface MarketingHypothesis {
  hypothesis: string;
  rationale: string;
  status: string;
}

export interface ProductIntelligenceReport {
  product_id: string;
  product_title: string;
  confirmed_facts: ProductFact[];
  documented_benefits: ProductBenefit[];
  commercial_proofs: CommercialProof[];
  missing_information: string[];
  marketing_hypotheses: MarketingHypothesis[];
}

export interface VoicePreferences {
  gender?: string;
  tone?: string;
  accent?: string;
  speed?: number;
}

export interface MusicPreferences {
  genre?: string;
  mood?: string;
  volume?: number;
}

// "Configuration créative" (formerly "UGC Setup"). DB table/columns keep the ugc_setup name.
export interface CreativeConfig {
  id: string;
  user_id: string;
  product_id: string;
  concept_type?: CreativeConceptType | string;
  objective: CampaignObjective;
  target_audience: string;
  target_motivation: string;
  primary_emotion: string;
  creative_angle: string;
  video_style: VideoStyle;
  target_duration: 15 | 30 | 45 | 60;
  platform: TargetPlatform;
  language: string;
  aspect_ratio: string;
  call_to_action: string;
  voice_preferences: Record<string, unknown>;
  music_preferences: Record<string, unknown>;
  user_constraints?: string | null;
  custom_brand_guidelines?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreativeConfigCreatePayload {
  product_id: string;
  concept_type?: CreativeConceptType | string;
  objective: CampaignObjective;
  target_audience: string;
  target_motivation: string;
  primary_emotion: string;
  creative_angle: string;
  video_style?: VideoStyle;
  target_duration?: 15 | 30 | 45 | 60;
  platform?: TargetPlatform;
  language?: string;
  aspect_ratio?: string;
  call_to_action: string;
  voice_preferences?: Record<string, unknown>;
  music_preferences?: Record<string, unknown>;
  user_constraints?: string;
  custom_brand_guidelines?: string;
}

export interface CreativeConfigUpdatePayload {
  concept_type?: CreativeConceptType | string;
  objective?: CampaignObjective;
  target_audience?: string;
  target_motivation?: string;
  primary_emotion?: string;
  creative_angle?: string;
  video_style?: VideoStyle;
  target_duration?: 15 | 30 | 45 | 60;
  platform?: TargetPlatform;
  language?: string;
  aspect_ratio?: string;
  call_to_action?: string;
  voice_preferences?: Record<string, unknown>;
  music_preferences?: Record<string, unknown>;
  user_constraints?: string;
  custom_brand_guidelines?: string;
}

export interface PersuasionTechnique {
  technique: string;
  justification: string;
}

export interface ProofElement {
  text: string;
  status: 'verified' | 'needs_validation';
  source: string;
}

export interface NarrativeStructure {
  hook: string;
  context: string;
  reveal: string;
  demonstration: string;
  resolution: string;
  cta: string;
}

// ============================================
// Module 2 — Creative Intelligence
// Mirrors app/schemas/creative_intelligence.py (backend). Keep both in sync.
// Decimal costs arrive as JSON strings (Pydantic v2), null when not measured.
// ============================================

export type PersuasiveRole = 'hook' | 'problem' | 'demo' | 'proof' | 'contrast' | 'cta' | 'other';
export type ViolationSeverity = 'block' | 'warn';
export type CreativeGenerationStatus = 'processing' | 'completed' | 'failed';

export interface CreativeBrief {
  product_facts: string[];
  marketing_objectives: string[];
  audience: string;
  platform: string;
  target_duration: number;
  language: string;
  forbidden_claims: string[];
  needs_validation: string[];
}

export interface CreativeAngle {
  id: string;
  archetype: string;
  title: string;
  promise: string;
  problem: string;
  emotion: string;
  proof_basis: string[];
  persuasion_principles: string[];
  risks: string[];
}

export interface CreativeConcept {
  angle_id: string;
  logline: string;
  script: string;
}

export interface StoryboardSpec {
  angle?: CreativeAngle | null;
  target_duration?: number;
  promise?: string;
  problem?: string;
  concept?: CreativeConcept | null;
  consistency_checks?: string[];
  global_constraints?: string[];
  persuasion_report?: Record<string, unknown> | null;
}

export interface ComplianceViolation {
  rule_code: string;
  severity: ViolationSeverity;
  shot_order: number | null;
  text: string;
  suggestion: string | null;
}

/** Provenance + cost fields shared by strategy and storyboard responses. */
export interface CreativeGenerationMeta {
  is_heuristic: boolean;
  provider: string;
  model: string | null;
  prompt_version: string;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost_usd: string | null;
  actual_cost_usd: string | null;
  reused?: boolean;
  edited_by_user?: boolean;
}

export interface CreativeStrategy extends CreativeGenerationMeta {
  brief: CreativeBrief | null;
  angles: CreativeAngle[];
  chosen_angle_id: string | null;
  status?: string;
  analysis_id?: string | null;
  id: string;
  user_id: string;
  product_id: string;
  ugc_setup_id: string;
  concept_type?: CreativeConceptType | string;
  campaign_objective: string;
  target_audience: string;
  core_motivation: string;
  purchase_barrier: string;
  is_barrier_hypothesis: boolean;
  creative_angle: string;
  primary_emotion: string;
  persuasion_techniques: PersuasionTechnique[];
  value_proposition: string;
  proof_elements: ProofElement[];
  narrative_structure: NarrativeStructure;
  character_bible?: Record<string, unknown> | Array<Record<string, unknown>>;
  environment_bible?: Record<string, unknown> | Array<Record<string, unknown>>;
  product_bible?: Record<string, unknown> | Array<Record<string, unknown>>;
  visual_grammar?: Record<string, unknown>;
  sound_design?: Record<string, unknown>;
  creative_rationale?: string;
  compliance_report?: Record<string, unknown>;
  cta_recommendation: string;
  schema_version: string;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreativeStrategyGeneratePayload {
  product_id: string;
  config_id?: string;
  custom_instructions?: string;
  force?: boolean;
}

export interface StoryboardVersionSummary {
  id: string;
  version: number;
  parent_id: string | null;
  generation_status: CreativeGenerationStatus;
  is_heuristic: boolean;
  provider: string;
  model: string | null;
  accepted: boolean;
  edited_by_user: boolean;
  block_count: number;
  warn_count: number;
  accepted_at: string | null;
  estimated_cost_usd: string | null;
  actual_cost_usd: string | null;
  created_at: string;
}

export interface StrategyCost {
  storyboard_id: string | null;
  analysis_cost: string | null;
  strategy_cost: string | null;
  storyboard_cost: string | null;
  /** Asset pipeline jobs of the accepted storyboard (module 3); absent on older backends. */
  asset_cost?: string | null;
  /** Every render attempt of the accepted storyboard (module 4); absent on older backends. */
  video_cost?: string | null;
  total_estimated: string | null;
  total_actual: string | null;
  is_heuristic: boolean;
}

export interface StoryboardScene {
  id: string;
  storyboard_id: string;
  scene_order: number;
  duration_seconds: number;
  narrative_function: NarrativeFunction;
  visual_type: SceneVisualType;
  visual_description: string;
  video_prompt: string;
  camera_movement: string;
  character_ref_id?: string | null;
  environment_ref_id?: string | null;
  product_presence?: 'prominent' | 'subtle' | 'none';
  keyframe_url?: string | null;
  voiceover_text?: string | null;
  on_screen_text?: string | null;
  product_image_url?: string | null;
  audio_ambiance?: string | null;
  continuity_notes?: string | null;
  feasibility_status?: VisualFeasibilityStatus;
  feasibility_score?: number;
  feasibility_notes?: string | null;
  fallback_alternative?: string | null;
  technical_risks?: Array<Record<string, unknown>> | string[];
  acceptance_criteria?: string[];
  persuasive_role?: PersuasiveRole | null;
  transition_out?: string | null;
  constraints?: string[];
  reference_urls?: string[];
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryboardSceneCreatePayload {
  scene_order: number;
  duration_seconds: number;
  narrative_function: NarrativeFunction;
  visual_type: SceneVisualType;
  visual_description: string;
  video_prompt: string;
  camera_movement?: string;
  character_ref_id?: string | null;
  environment_ref_id?: string | null;
  product_presence?: 'prominent' | 'subtle' | 'none';
  keyframe_url?: string | null;
  voiceover_text?: string | null;
  on_screen_text?: string | null;
  product_image_url?: string | null;
  audio_ambiance?: string | null;
  continuity_notes?: string | null;
  feasibility_status?: VisualFeasibilityStatus;
  feasibility_score?: number;
  feasibility_notes?: string | null;
  fallback_alternative?: string | null;
  technical_risks?: Array<Record<string, unknown>> | string[];
  acceptance_criteria?: string[];
  persuasive_role?: PersuasiveRole | null;
  transition_out?: string | null;
  constraints?: string[];
  reference_urls?: string[];
  is_validated?: boolean;
}

export interface Storyboard extends CreativeGenerationMeta {
  id: string;
  user_id: string;
  product_id: string;
  strategy_id: string;
  title: string;
  target_duration: number;
  status: StoryboardStatus;
  schema_version: string;
  scenes: StoryboardScene[];
  version: number;
  parent_id: string | null;
  spec: StoryboardSpec | null;
  generation_status: CreativeGenerationStatus;
  persuasion_rules_version: string;
  violations: ComplianceViolation[];
  accepted: boolean;
  accepted_at: string | null;
  is_latest: boolean;
  edited_by_user: boolean;
  error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryboardCreatePayload {
  product_id: string;
  strategy_id: string;
  title: string;
  target_duration: number;
  status?: StoryboardStatus;
  schema_version?: string;
  scenes: StoryboardSceneCreatePayload[];
}

export interface StoryboardUpdatePayload {
  title?: string;
  status?: StoryboardStatus;
  scenes?: StoryboardSceneCreatePayload[];
}

export type QualityTier = 'draft' | 'standard' | 'premium';

export interface VideoGenerationJobCreatePayload {
  product_id: string;
  storyboard_id: string;
  /** Pins an engine; the API answers 409 when it is not eligible. */
  provider_name?: string;
  quality_tier?: QualityTier;
  /** USD, > 0 and <= 100; backend default when omitted. */
  budget_usd?: string | number;
  idempotency_key?: string;
}

export type ShotRenderStatus =
  | 'pending'
  | 'routing'
  | 'rendering'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'needs_action'
  | 'cancelled'
  | 'checking'
  | 'quality_review';

/** One quality check (module 5): a row of data, never an opaque score. */
export interface QualityCheck {
  name: string;
  layer: 'A' | 'B' | 'C';
  status: 'pass' | 'fail' | 'warn' | 'skipped' | 'unavailable';
  value: number | string | null;
  threshold: number | string | null;
  /** French, user-facing. */
  detail: string;
  blocking: boolean;
}

/** ShotQualityResponse: the check of the shot's result attempt. */
export interface ShotQuality {
  decision: 'accept' | 'regenerate' | 'needs_review';
  /** French. */
  reasons: string[];
  checks: QualityCheck[];
  is_mock: boolean;
  embedder_is_mock: boolean | null;
  /** "uncalibrated-…" until thresholds are calibrated on hand-labelled clips. */
  thresholds_version: string;
  overridden_by_user: boolean;
  created_at: string;
  cost_usd: string | null;
}

export interface RouteCandidate {
  provider: string;
  model: string;
  display_name?: string | null;
  eligible: boolean;
  /** Router reason code (blueprint §3) when not eligible. */
  rejected_reason?: string | null;
  score?: number | null;
  success_rate?: number | string | null;
  sample_size?: number | null;
  est_cost_usd?: string | null;
}

export interface ShotRouting {
  reason_code: string;
  /** French one-line explanation. */
  summary: string;
  candidates: RouteCandidate[];
}

export interface RenderAttempt {
  id: string;
  attempt_no: number;
  provider: string;
  model: string;
  status: string;
  error_kind?: string | null;
  /** French. */
  error_text?: string | null;
  estimated_cost_usd?: string | null;
  actual_cost_usd?: string | null;
  cost_reconciled?: boolean;
  possibly_billed?: boolean;
  submitted_at?: string | null;
  completed_at?: string | null;
  latency_ms?: number | null;
}

/** ShotRenderResponse (module 4 model router). */
export interface ShotRender {
  shot_id: string;
  scene_id: string;
  scene_order: number;
  persuasive_role?: string | null;
  shot_class?: string | null;
  status: ShotRenderStatus;
  provider?: string | null;
  model?: string | null;
  display_name?: string | null;
  /** Missing counts as a simulation (fail closed). */
  is_mock?: boolean;
  resolution?: string | null;
  duration_shot_s?: number | string | null;
  duration_billed_s?: number | string | null;
  routing?: ShotRouting | null;
  attempts: RenderAttempt[];
  estimated_cost_usd?: string | null;
  actual_cost_usd?: string | null;
  clip_asset_id?: string | null;
  clip_url?: string | null;
  action?: 'confirm_rerender' | 'pick_engine' | null;
  /** Module 5 quality check; null until checked (and on older jobs). */
  quality?: ShotQuality | null;
}

export interface GeneratedAsset {
  id: string;
  user_id: string;
  job_id: string;
  asset_type: AssetType;
  storage_path: string;
  file_url: string;
  mime_type: string;
  file_size_bytes?: number | null;
  duration_seconds?: number | null;
  width?: number | null;
  height?: number | null;
  aspect_ratio?: string | null;
  metadata_info?: Record<string, unknown> | null;
  created_at: string;
}

export interface QualityReport {
  id: string;
  job_id: string;
  overall_score: number;
  passed: boolean;
  duration_check: { target: number; actual: number; passed: boolean };
  resolution_check: { expected: string; actual: string; passed: boolean };
  audio_sync_check: { passed: boolean; has_audio: boolean };
  visual_continuity_check: { passed: boolean; notes?: string };
  ethical_compliance_check: { passed: boolean; no_fake_reviews: boolean; no_false_claims: boolean };
  issues: Array<{ type: string; message: string; severity?: string }>;
  created_at: string;
}

export interface VideoGenerationJob {
  id: string;
  user_id: string;
  product_id: string;
  storyboard_id: string;
  provider_name: string;
  model_name?: string;
  model_version?: string;
  status: JobStatus;
  compliance_status?: string;
  compliance_report?: Record<string, unknown>;
  training_eligibility?: string;
  scene_job_statuses?: Record<string, unknown>;
  edl_timeline?: Record<string, unknown>;
  progress_percentage: number;
  current_step?: string | null;
  error_message?: string | null;
  retry_count: number;
  estimated_cost?: number | string | null;
  actual_cost?: number | string | null;
  quality_tier?: QualityTier;
  budget_usd?: string | null;
  budget_remaining_usd?: string | null;
  cost_is_heuristic?: boolean;
  /** Per-shot renders (module 4); absent on jobs created before the model router. */
  shots?: ShotRender[];
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  assets: GeneratedAsset[];
  quality_report?: QualityReport | null;
}

export interface ModelCapabilitySummary {
  name: string;
  display_name: string;
  provider_type: 'mock' | 'commercial_api' | 'self_hosted_gpu' | string;
  supported_aspect_ratios: string[];
  max_duration_seconds: number;
  supports_text_to_video: boolean;
  supports_image_to_video: boolean;
  supports_character_reference: boolean;
  cost_per_second_usd: number;
  average_latency_seconds: number;
  is_active: boolean;
}

export interface ComplianceCheckItem {
  rule_code: string;
  rule_description: string;
  severity: 'info' | 'warning' | 'blocking' | string;
  passed: boolean;
  details: string;
  suggested_action?: string | null;
}

export interface ComplianceReport {
  overall_status: ComplianceStatus;
  platform: string;
  rules_applied_version: string;
  checks: ComplianceCheckItem[];
  claims_verified: string[];
  claims_unverified_or_risky: string[];
  summary_message: string;
}

export interface TrainingConsent {
  id: string;
  user_id: string;
  consent_type: string;
  granted: boolean;
  consent_scope: string[];
  consent_version: string;
  legal_basis: string;
  retention_days: number;
  granted_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AdPerformanceMetric {
  id: string;
  user_id: string;
  job_id: string;
  platform: string;
  campaign_id?: string | null;
  impressions: number;
  views?: number;
  watch_time_seconds?: number;
  retention_rate_3s?: number | null;
  clicks: number;
  ctr?: number | null;
  add_to_carts?: number;
  conversions: number;
  attributed_sales?: number;
  currency?: string;
  cost_per_result?: number | null;
  attribution_source?: string;
  spend?: number;
  revenue?: number;
  roas?: number | null;
  view_through_rate?: number | null;
  watch_time_avg_seconds?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DatasetManifestItem {
  artifact_id: string;
  product_title: string;
  concept_type: string;
  prompt: string;
  video_storage_path: string;
  qa_score: number;
  training_eligibility: string;
  consent_verified: boolean;
  license_type: string;
  split: 'train' | 'eval';
}

export interface DatasetManifest {
  manifest_version: string;
  generated_at: string;
  total_eligible_items: number;
  train_count: number;
  eval_count: number;
  excluded_or_revoked_count: number;
  items: DatasetManifestItem[];
}
