export type CampaignObjective = 'sales' | 'traffic' | 'awareness' | 'retargeting';
export type VideoStyle = 'hybrid' | 'ugc_natural' | 'cinematic';
export type TargetPlatform = 'tiktok' | 'instagram_reels' | 'facebook' | 'youtube';
export type NarrativeFunction =
  'hook' | 'context' | 'reveal' | 'demonstration' | 'resolution' | 'cta';
export type SceneVisualType = 'human' | 'product' | 'hybrid';
export type StoryboardStatus = 'draft' | 'validated' | 'generating' | 'completed' | 'failed';
export type JobStatus =
  'pending' | 'processing' | 'rendering' | 'assembling' | 'completed' | 'failed' | 'cancelled';
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

export interface UGCSetup {
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

export interface UGCSetupCreatePayload {
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

export interface UGCSetupUpdatePayload {
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

export interface CreativeStrategy {
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
  ugc_setup_id?: string;
  custom_instructions?: string;
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
  is_validated?: boolean;
}

export interface Storyboard {
  id: string;
  user_id: string;
  product_id: string;
  strategy_id: string;
  title: string;
  target_duration: number;
  status: StoryboardStatus;
  schema_version: string;
  scenes: StoryboardScene[];
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

export interface VideoGenerationJobCreatePayload {
  product_id: string;
  storyboard_id: string;
  provider_name?: string;
  idempotency_key?: string;
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
  estimated_cost?: number | null;
  actual_cost?: number | null;
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
