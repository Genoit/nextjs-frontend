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
