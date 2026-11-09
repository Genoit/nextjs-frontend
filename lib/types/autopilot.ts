// Autopilot API contract (fastapi-backend app/schemas/autopilot.py).

export type AutopilotStatus =
  | 'analyzing'
  | 'awaiting_confirmation'
  | 'planning'
  | 'generating'
  | 'finishing'
  | 'ready'
  | 'partial'
  | 'failed'
  | 'cancelled';

export interface AutopilotFacts {
  name: string;
  price: string | null;
  benefits: string[];
  image_urls: string[];
}

export interface AutopilotVariant {
  id: string;
  angle_id: string;
  angle_label: string | null;
  status: 'pending' | 'storyboarding' | 'rendering' | 'exporting' | 'ready' | 'failed';
  download_url: string | null;
  thumbnail_url: string | null;
  /** Rendered by a mock engine: never present it as a real ad. */
  simulated: boolean;
  error: string | null;
}

export interface AutopilotRun {
  id: string;
  product_id: string;
  status: AutopilotStatus;
  variant_count: number;
  facts: AutopilotFacts | null;
  variants: AutopilotVariant[];
  cost_actual_usd: string | null;
  error: string | null;
  created_at: string;
}
