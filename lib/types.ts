export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  onboarding_completed: boolean;
  auth_provider?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type OnboardingProfile = 'starting' | 'selling' | 'dropshipper' | 'scaling';
export type OnboardingBusinessType = 'dropshipping' | 'dtc_brand' | 'marketplace_seller' | 'other';
export type OnboardingCategory =
  'fashion' | 'beauty' | 'home' | 'electronics' | 'fitness' | 'pets' | 'other';
export type OnboardingExperience = 'beginner' | 'intermediate' | 'advanced';
export type OnboardingStoreConnection = 'shopify' | 'woocommerce' | 'manual';
export type OnboardingGoal = 'products' | 'ads' | 'sales' | 'scale' | 'performance';

export interface OnboardingProgress {
  id: string;
  current_step: number;
  profile: OnboardingProfile | null;
  business_type: OnboardingBusinessType | null;
  main_category: OnboardingCategory | null;
  target_market: string | null;
  experience_level: OnboardingExperience | null;
  store_connection: OnboardingStoreConnection | null;
  goals: OnboardingGoal[];
  is_completed: boolean;
  completed_at: string | null;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiError {
  detail?: string | { msg: string }[];
  message?: string;
}
