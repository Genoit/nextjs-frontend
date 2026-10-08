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

export const TOKEN_KEY = 'trended_access_token';
export const REFRESH_TOKEN_KEY = 'trended_refresh_token';

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
  code?: string;

  constructor(message: string, status: number, data?: unknown, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: unknown = null;
    let errorCode: string | undefined = response.headers.get('x-error-code') || undefined;

    try {
      errorData = await response.json();
      if (errorData && typeof errorData === 'object') {
        const d = errorData as {
          detail?: unknown;
          message?: string;
          code?: string;
          error?: { code?: string; message?: string };
        };

        if (d.error && typeof d.error === 'object') {
          if (typeof d.error.code === 'string') {
            errorCode = d.error.code;
          }
          if (typeof d.error.message === 'string') {
            errorMessage = d.error.message;
          }
        }

        if (d.code && typeof d.code === 'string') {
          errorCode = d.code;
        }

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

    throw new ApiRequestError(errorMessage, response.status, errorData, errorCode);
  }

  return response.json() as Promise<T>;
}

let refreshPromise: Promise<AuthResponse> | null = null;
let tokenRefreshListeners: ((token: string) => void)[] = [];

export function onTokenRefreshed(callback: (token: string) => void): () => void {
  tokenRefreshListeners.push(callback);
  return () => {
    tokenRefreshListeners = tokenRefreshListeners.filter((cb) => cb !== callback);
  };
}

export async function refreshSession(): Promise<AuthResponse> {
  const refreshToken =
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  if (!refreshToken) {
    throw new ApiRequestError('No refresh token available', 401, null, 'AUTHENTICATION_REQUIRED');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const data = await api.refreshToken(refreshToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, data.access_token);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        }
        tokenRefreshListeners.forEach((cb) => cb(data.access_token));
        return data;
      } catch (err) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function fetchWithAuth<T>(
  endpoint: string,
  init: RequestInit = {},
  explicitToken?: string,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let currentToken =
    explicitToken || (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

  const makeRequest = async (token: string | null) => {
    const headers = new Headers(init.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(url, { ...init, headers });
  };

  let response = await makeRequest(currentToken);

  // If unauthorized (e.g. access token expired), attempt token refresh and retry once
  if (response.status === 401) {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    if (refreshToken) {
      try {
        const refreshed = await refreshSession();
        currentToken = refreshed.access_token;
        response = await makeRequest(currentToken);
      } catch {
        // Refresh failed, let handleResponse process the original or error response
      }
    }
  }

  return handleResponse<T>(response);
}

async function authenticatedRequest<T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: object,
): Promise<T> {
  return fetchWithAuth<T>(
    path,
    {
      method,
      body: body ? JSON.stringify(body) : undefined,
    },
    token,
  );
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

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const url = `${getApiBaseUrl()}/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return handleResponse<AuthResponse>(response);
  },

  async getMe(token?: string): Promise<User> {
    return fetchWithAuth<User>('/auth/me', { method: 'GET' }, token);
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
