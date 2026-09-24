import {
  AuthResponse,
  LoginPayload,
  OnboardingBusinessType,
  OnboardingCategory,
  OnboardingExperience,
  OnboardingGoal,
  OnboardingProfile,
  OnboardingProgress,
  OnboardingStoreConnection,
  RegisterPayload,
  User,
} from './types';

function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const trimmed = raw.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v1')) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

export class ApiRequestError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: unknown = null;

    try {
      errorData = await response.json();
      if (errorData && typeof errorData === 'object') {
        const d = errorData as { detail?: unknown; message?: string };
        if (typeof d.detail === 'string') {
          errorMessage = d.detail;
        } else if (Array.isArray(d.detail)) {
          errorMessage = d.detail
            .map((item) =>
              typeof item === 'object' && item && 'msg' in item
                ? (item as { msg: string }).msg
                : JSON.stringify(item),
            )
            .join(', ');
        } else if (d.message) {
          errorMessage = d.message;
        }
      }
    } catch {
      // Non-JSON response
    }

    throw new ApiRequestError(errorMessage, response.status, errorData);
  }

  return response.json() as Promise<T>;
}

async function authenticatedRequest<T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: object,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return handleResponse<T>(response);
}

export const api = {
  async register(payload: RegisterPayload): Promise<User> {
    const url = `${getApiBaseUrl()}/auth/register`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<User>(response);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const url = `${getApiBaseUrl()}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(response);
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const url = `${getApiBaseUrl()}/auth/google`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_token: idToken }),
    });
    return handleResponse<AuthResponse>(response);
  },

  async getMe(token: string): Promise<User> {
    const url = `${getApiBaseUrl()}/auth/me`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<User>(response);
  },

  getOnboarding(token: string): Promise<OnboardingProgress> {
    return authenticatedRequest('/onboarding/me', token);
  },

  saveOnboardingStep1(token: string, profile: OnboardingProfile): Promise<OnboardingProgress> {
    return authenticatedRequest('/onboarding/me/step/1', token, 'PUT', { profile });
  },

  saveOnboardingStep2(
    token: string,
    data: {
      business_type: OnboardingBusinessType;
      main_category: OnboardingCategory;
      target_market: string;
      experience_level: OnboardingExperience;
    },
  ): Promise<OnboardingProgress> {
    return authenticatedRequest('/onboarding/me/step/2', token, 'PUT', data);
  },

  saveOnboardingStep3(
    token: string,
    store_connection: OnboardingStoreConnection,
  ): Promise<OnboardingProgress> {
    return authenticatedRequest('/onboarding/me/step/3', token, 'PUT', {
      store_connection,
    });
  },

  saveOnboardingStep4(token: string, goals: OnboardingGoal[]): Promise<OnboardingProgress> {
    return authenticatedRequest('/onboarding/me/step/4', token, 'PUT', { goals });
  },

  completeOnboarding(token: string): Promise<OnboardingProgress> {
    return authenticatedRequest('/onboarding/me/complete', token, 'POST');
  },
};
