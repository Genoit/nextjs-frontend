// Mirrors app/schemas/product_analysis.py (backend). Keep both in sync.

export type SourceKind = 'structured_data' | 'page_metadata' | 'page_text' | 'user_input' | 'image';

export type RiskFlag = 'health_claim';

export interface Provenance {
  field: string;
  evidence: string;
  source: SourceKind | null;
}

export interface SheetFact {
  attribute: string;
  value: string;
  provenance: Provenance;
  risk_flags: RiskFlag[];
}

export interface Hypothesis {
  statement: string;
  rationale: string;
  status: 'needs_validation';
}

export interface MarketingAngle {
  customer_problem: Hypothesis | null;
  target_audience: Hypothesis | null;
  demonstrable_solution: Hypothesis | null;
}

export interface VisualIdentity {
  colors: string[];
  packaging_shape: string | null;
  elements_to_preserve: string[];
  reference_image_urls: string[];
}

export interface ProductSheet {
  normalized_name: string;
  category: string | null;
  verified_facts: SheetFact[];
  visible_characteristics: SheetFact[];
  seller_claims: SheetFact[];
  visual_identity: VisualIdentity;
  marketing_angle: MarketingAngle;
  marketing_hypotheses: Hypothesis[];
  missing_information: string[];
  do_not_invent: string[];
}

export interface GroundingIssue {
  section: string;
  attribute: string;
  reason: 'unknown_field' | 'evidence_not_found' | 'risk_flagged';
  detail: string | null;
}

export type AnalysisStatus = 'processing' | 'completed' | 'partial' | 'failed';

export interface ProductAnalysis {
  id: string;
  product_id: string;
  version: number;
  status: AnalysisStatus;
  provider: string;
  model: string | null;
  is_heuristic: boolean;
  prompt_version: string;
  sheet: ProductSheet | null;
  grounding_issues: GroundingIssue[];
  partial_reasons: string[];
  error: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost_usd: string | null;
  actual_cost_usd: string | null;
  latency_ms: number | null;
  reused: boolean;
  created_at: string;
  completed_at: string | null;
}
