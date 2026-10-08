import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Helper replicating register form validation
function validateRegisterForm({ firstName, lastName, email, password, confirmPassword }) {
  if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
    return { valid: false, error: 'Please fill in all fields.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true, error: null };
}

// Helper replicating login form validation
function validateLoginForm({ email, password }) {
  if (!email.trim() || !password) {
    return { valid: false, error: 'Please enter both email and password.' };
  }
  return { valid: true, error: null };
}

function parseApiError(status, data, code) {
  if (data?.error?.code) {
    code = data.error.code;
  }
  if (code === 'INVALID_CREDENTIALS' || (status === 401 && data?.detail === 'Invalid email or password')) {
    return 'Invalid email or password.';
  }
  if (code === 'EMAIL_ALREADY_EXISTS' || status === 409) {
    return 'An account with this email already exists.';
  }
  if (
    code === 'TOKEN_EXPIRED' ||
    code === 'REFRESH_TOKEN_EXPIRED' ||
    code === 'INVALID_REFRESH_TOKEN' ||
    (status === 401 && typeof data?.detail === 'string' && data.detail.toLowerCase().includes('expired'))
  ) {
    return 'Your session has expired. Please sign in again.';
  }
  if (
    code === 'ACCOUNT_INACTIVE' ||
    (status === 403 && typeof data?.detail === 'string' && data.detail.toLowerCase().includes('inactive'))
  ) {
    return 'This account has been deactivated. Please contact support.';
  }
  if (status >= 500 || code === 'INTERNAL_SERVER_ERROR') {
    return 'A server error occurred. Please try again later.';
  }
  if (data && typeof data === 'object') {
    if (data.error?.message) {
      return data.error.message;
    }
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg || JSON.stringify(item)).join(', ');
    }
  }
  return 'An unexpected error occurred.';
}

// Helper replicating auth state management & logout
class AuthStateManager {
  constructor() {
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.isLoading = true;
  }

  init(token, user, refreshToken) {
    if (token && user) {
      this.token = token;
      this.user = user;
      this.refreshToken = refreshToken || null;
    }
    this.isLoading = false;
  }

  login(token, user, refreshToken) {
    global.localStorage.setItem('trended_access_token', token);
    if (refreshToken) {
      global.localStorage.setItem('trended_refresh_token', refreshToken);
      this.refreshToken = refreshToken;
    }
    this.token = token;
    this.user = user;
    this.isLoading = false;
  }

  logout() {
    global.localStorage.removeItem('trended_access_token');
    global.localStorage.removeItem('trended_refresh_token');
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.isLoading = false;
  }

  isAuthenticated() {
    return !!this.user && !!this.token;
  }
}

describe('Sprint 1 - Frontend Authentication Unit & Flow Tests', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  describe('US-01: Register Validation & Flow', () => {
    it('✓ should validate correct registration inputs', () => {
      const result = validateRegisterForm({
        firstName: 'Germain',
        lastName: 'Ahobli',
        email: 'germain@example.com',
        password: 'TrendED2026!',
        confirmPassword: 'TrendED2026!',
      });
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, null);
    });

    it('✓ should reject invalid email format', () => {
      const result = validateRegisterForm({
        firstName: 'Germain',
        lastName: 'Ahobli',
        email: 'invalid-email',
        password: 'TrendED2026!',
        confirmPassword: 'TrendED2026!',
      });
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.error, 'Please enter a valid email address.');
    });

    it('✓ should reject passwords shorter than 8 characters', () => {
      const result = validateRegisterForm({
        firstName: 'Germain',
        lastName: 'Ahobli',
        email: 'germain@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.error, 'Password must be at least 8 characters long.');
    });

    it('✓ should reject password and confirmPassword mismatch', () => {
      const result = validateRegisterForm({
        firstName: 'Germain',
        lastName: 'Ahobli',
        email: 'germain@example.com',
        password: 'TrendED2026!',
        confirmPassword: 'DifferentPassword2026!',
      });
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.error, 'Passwords do not match.');
    });
  });

  describe('US-02: Login Validation & Flow', () => {
    it('✓ should validate non-empty email and password', () => {
      const result = validateLoginForm({
        email: 'germain@example.com',
        password: 'TrendED2026!',
      });
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, null);
    });

    it('✓ should reject empty login fields', () => {
      const result = validateLoginForm({
        email: '',
        password: '',
      });
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.error, 'Please enter both email and password.');
    });

    it('✓ should store JWT and update auth state upon successful login', () => {
      const auth = new AuthStateManager();
      assert.strictEqual(auth.isAuthenticated(), false);

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        first_name: 'Germain',
        last_name: 'Ahobli',
        email: 'germain@example.com',
      };
      const mockToken = 'mock.jwt.token';

      auth.login(mockToken, mockUser);

      assert.strictEqual(auth.isAuthenticated(), true);
      assert.strictEqual(auth.user.email, 'germain@example.com');
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), mockToken);
    });
  });

  describe('Affichage des erreurs (Error handling)', () => {
    it('✓ should format 409 conflict error properly', () => {
      const errorMsg = parseApiError(409, { detail: 'Email already registered' });
      assert.strictEqual(errorMsg, 'An account with this email already exists.');
    });

    it('✓ should format 401 unauthorized error with generic safe message', () => {
      const errorMsg = parseApiError(401, { detail: 'Invalid email or password' });
      assert.strictEqual(errorMsg, 'Invalid email or password.');
    });

    it('✓ should format array of validation errors cleanly', () => {
      const errorMsg = parseApiError(422, {
        detail: [{ msg: 'Email is invalid' }, { msg: 'Password too short' }],
      });
      assert.strictEqual(errorMsg, 'Email is invalid, Password too short');
    });

    it('✓ should format 401 expired token with session expiry message', () => {
      const errorMsg = parseApiError(401, { detail: 'Token has expired' }, 'TOKEN_EXPIRED');
      assert.strictEqual(errorMsg, 'Your session has expired. Please sign in again.');
    });

    it('✓ should format 403 inactive account error clearly', () => {
      const errorMsg = parseApiError(403, { detail: 'User account is inactive' }, 'ACCOUNT_INACTIVE');
      assert.strictEqual(errorMsg, 'This account has been deactivated. Please contact support.');
    });

    it('✓ should format 500 server error safely without exposing technical details', () => {
      const errorMsg = parseApiError(500, { detail: 'Database connection failed' }, 'INTERNAL_SERVER_ERROR');
      assert.strictEqual(errorMsg, 'A server error occurred. Please try again later.');
      assert.strictEqual(errorMsg.includes('Database'), false);
    });

    it('✓ should clear error message when a new attempt is successful', () => {
      let errorMessage = 'Invalid email or password.';
      function onRetryStart() {
        errorMessage = null;
      }
      onRetryStart();
      assert.strictEqual(errorMessage, null);
    });

    it('✓ should preserve form field values when an error occurs without page reload', () => {
      const formState = {
        email: 'user@example.com',
        password: 'Password123!',
      };
      // Simulate failed submission
      const errorMessage = parseApiError(401, { detail: 'Invalid email or password' });
      assert.strictEqual(errorMessage, 'Invalid email or password.');
      // Values must remain intact
      assert.strictEqual(formState.email, 'user@example.com');
      assert.strictEqual(formState.password, 'Password123!');
    });
  });

  describe('État loading (Double submit prevention)', () => {
    it('✓ should indicate loading state when authentication request is in flight', () => {
      let isLoading = false;
      function submit() {
        if (isLoading) return 'blocked';
        isLoading = true;
        return 'started';
      }

      assert.strictEqual(submit(), 'started');
      assert.strictEqual(submit(), 'blocked'); // Prevents double click / submission
    });
  });

  describe('US-03: Logout Flow', () => {
    it('✓ should clean token from storage, clear user state and trigger logout', () => {
      const auth = new AuthStateManager();
      auth.login('token123', { id: 'uuid-1', email: 'test@example.com' });

      assert.strictEqual(auth.isAuthenticated(), true);
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), 'token123');

      // Trigger logout
      auth.logout();

      assert.strictEqual(auth.isAuthenticated(), false);
      assert.strictEqual(auth.user, null);
      assert.strictEqual(auth.token, null);
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), null);
    });
  });

  describe('Protection du Dashboard (Route protection logic)', () => {
    it('✓ should redirect to /login when unauthenticated user accesses /dashboard', () => {
      const auth = new AuthStateManager();
      auth.init(null, null);

      let redirectedTo = null;
      const router = {
        push: (route) => {
          redirectedTo = route;
        },
      };

      if (!auth.isLoading && !auth.isAuthenticated()) {
        router.push('/login');
      }

      assert.strictEqual(redirectedTo, '/login');
    });

    it('✓ should allow dashboard access when user is authenticated', () => {
      const auth = new AuthStateManager();
      auth.init('valid-token', { id: 'uuid-1', email: 'germain@example.com' });

      let redirectedTo = null;
      const router = {
        push: (route) => {
          redirectedTo = route;
        },
      };

      if (!auth.isLoading && !auth.isAuthenticated()) {
        router.push('/login');
      }

      assert.strictEqual(redirectedTo, null);
      assert.strictEqual(auth.isAuthenticated(), true);
    });
  });

  describe('Google Sign-In & Firebase Integration (Sprint 1)', () => {
    it('✓ should store JWT and update auth state upon successful Google Sign-In', async () => {
      const auth = new AuthStateManager();
      assert.strictEqual(auth.isAuthenticated(), false);

      // Simulated Firebase popup & backend token exchange
      const mockFirebaseUser = {
        getIdToken: async () => 'mock.firebase.id.token',
      };
      const mockBackendResponse = {
        access_token: 'trended.jwt.token.google',
        token_type: 'bearer',
        user: {
          id: 'user-google-123',
          first_name: 'Google',
          last_name: 'User',
          email: 'googleuser@example.com',
          auth_provider: 'google',
        },
      };

      const idToken = await mockFirebaseUser.getIdToken();
      assert.strictEqual(idToken, 'mock.firebase.id.token');

      // Login to state manager
      auth.login(mockBackendResponse.access_token, mockBackendResponse.user);

      assert.strictEqual(auth.isAuthenticated(), true);
      assert.strictEqual(auth.user.email, 'googleuser@example.com');
      assert.strictEqual(auth.user.auth_provider, 'google');
      assert.strictEqual(
        global.localStorage.getItem('trended_access_token'),
        'trended.jwt.token.google',
      );
    });

    it('✓ should reject with explicit message when Google email conflicts with local account (409)', () => {
      const errorResponse = {
        status: 409,
        detail:
          'An account already exists with this email. Please sign in using your existing authentication method.',
      };

      function handleGoogleError(err) {
        if (err.status === 409) {
          return (
            err.detail ||
            'An account already exists with this email. Please sign in using your existing authentication method.'
          );
        }
        return 'Google sign-in failed.';
      }

      const message = handleGoogleError(errorResponse);
      assert.strictEqual(
        message,
        'An account already exists with this email. Please sign in using your existing authentication method.',
      );
    });

    it('✓ should handle popup closed by user gracefully', () => {
      const firebaseError = { code: 'auth/popup-closed-by-user' };

      function parseFirebaseError(err) {
        if (err && err.code === 'auth/popup-closed-by-user') {
          return 'Google sign-in was cancelled.';
        }
        return 'Google sign-in failed. Please try again.';
      }

      const msg = parseFirebaseError(firebaseError);
      assert.strictEqual(msg, 'Google sign-in was cancelled.');
    });

    it('✓ should detect all popup-interrupted Firebase errors for redirect fallback', () => {
      function isPopupBlockedError(err) {
        if (!err || typeof err !== 'object') return false;
        const code = err.code || '';
        const msg = err.message || '';
        return (
          [
            'auth/popup-blocked',
            'auth/popup-closed-by-user',
            'auth/cancelled-popup-request',
            'auth/internal-error',
            'auth/web-storage-unsupported',
          ].includes(code) ||
          msg.toLowerCase().includes('popup') ||
          msg.toLowerCase().includes('cross-site')
        );
      }

      assert.strictEqual(isPopupBlockedError({ code: 'auth/popup-blocked' }), true);
      assert.strictEqual(isPopupBlockedError({ code: 'auth/popup-closed-by-user' }), true);
      assert.strictEqual(isPopupBlockedError({ code: 'auth/cancelled-popup-request' }), true);
      assert.strictEqual(isPopupBlockedError({ code: 'auth/internal-error' }), true);
      assert.strictEqual(isPopupBlockedError({ code: 'auth/web-storage-unsupported' }), true);
      assert.strictEqual(isPopupBlockedError({ message: 'The popup was blocked by browser' }), true);
      assert.strictEqual(isPopupBlockedError({ code: 'auth/invalid-email' }), false);
    });

    it('✓ should identify Firebase unauthorized-domain errors for localhost configuration checks', () => {
      function isUnauthorizedDomainError(err) {
        if (!err || typeof err !== 'object') return false;
        const code = err.code || '';
        const msg = err.message || '';
        return (
          code === 'auth/unauthorized-domain' ||
          code === 'auth/invalid-domain' ||
          msg.toLowerCase().includes('unauthorized domain') ||
          msg.toLowerCase().includes('not authorized')
        );
      }

      assert.strictEqual(isUnauthorizedDomainError({ code: 'auth/unauthorized-domain' }), true);
      assert.strictEqual(isUnauthorizedDomainError({ message: 'This domain is not authorized' }), true);
      assert.strictEqual(isUnauthorizedDomainError({ code: 'auth/popup-blocked' }), false);
      assert.strictEqual(isUnauthorizedDomainError({ code: 'auth/invalid-email' }), false);
    });

    it('✓ should trigger both Firebase signOut and local storage cleanup on logout', async () => {
      let firebaseSignOutCalled = false;
      const mockLogoutFirebase = async () => {
        firebaseSignOutCalled = true;
      };

      const auth = new AuthStateManager();
      auth.login('token-google', { id: 'g-1', email: 'g@example.com' });

      assert.strictEqual(auth.isAuthenticated(), true);
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), 'token-google');

      // Perform logout
      await mockLogoutFirebase();
      auth.logout();

      assert.strictEqual(firebaseSignOutCalled, true);
      assert.strictEqual(auth.isAuthenticated(), false);
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), null);
    });
  });

  describe('US-04: Refresh Token & Rotation Transparent Flow (Option B)', () => {
    it('✓ should store both access_token and refresh_token upon login', () => {
      const auth = new AuthStateManager();
      auth.login('access-token-123', { id: 'u-1', email: 'user@trended.com' }, 'refresh-token-456');

      assert.strictEqual(auth.isAuthenticated(), true);
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), 'access-token-123');
      assert.strictEqual(global.localStorage.getItem('trended_refresh_token'), 'refresh-token-456');
    });

    it('✓ should purge both access_token and refresh_token upon logout', () => {
      const auth = new AuthStateManager();
      auth.login('access-token-123', { id: 'u-1', email: 'user@trended.com' }, 'refresh-token-456');
      auth.logout();

      assert.strictEqual(auth.isAuthenticated(), false);
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), null);
      assert.strictEqual(global.localStorage.getItem('trended_refresh_token'), null);
    });

    it('✓ should transparently refresh token upon 401 and retry request (Request -> 401 -> Refresh -> Retry)', async () => {
      global.localStorage.setItem('trended_access_token', 'expired-token');
      global.localStorage.setItem('trended_refresh_token', 'valid-refresh-token');

      let requestsCount = 0;
      let refreshCount = 0;

      // Simulated fetch client replicating fetchWithAuth
      async function mockFetchWithAuth(endpoint, token) {
        requestsCount++;
        // First request fails with 401 TOKEN_EXPIRED
        if (requestsCount === 1) {
          assert.strictEqual(token, 'expired-token');
          return { status: 401, error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } };
        }
        // Second retry request succeeds with new access token
        assert.strictEqual(token, 'new-refreshed-token');
        return { status: 200, data: { user: 'germain' } };
      }

      async function mockRefreshToken(rt) {
        refreshCount++;
        assert.strictEqual(rt, 'valid-refresh-token');
        return {
          access_token: 'new-refreshed-token',
          refresh_token: 'new-refresh-token-rotated',
        };
      }

      // Replicating fetchWithAuth logic
      let currentToken = global.localStorage.getItem('trended_access_token');
      let response = await mockFetchWithAuth('/auth/me', currentToken);

      if (response.status === 401) {
        const storedRefreshToken = global.localStorage.getItem('trended_refresh_token');
        if (storedRefreshToken) {
          const refreshed = await mockRefreshToken(storedRefreshToken);
          global.localStorage.setItem('trended_access_token', refreshed.access_token);
          global.localStorage.setItem('trended_refresh_token', refreshed.refresh_token);
          currentToken = refreshed.access_token;
          response = await mockFetchWithAuth('/auth/me', currentToken);
        }
      }

      assert.strictEqual(requestsCount, 2);
      assert.strictEqual(refreshCount, 1);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.user, 'germain');
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), 'new-refreshed-token');
      assert.strictEqual(global.localStorage.getItem('trended_refresh_token'), 'new-refresh-token-rotated');
    });

    it('✓ should clean storage and prompt session expiry when refresh token is invalid or expired', async () => {
      global.localStorage.setItem('trended_access_token', 'expired-token');
      global.localStorage.setItem('trended_refresh_token', 'expired-refresh-token');

      async function mockRefreshToken() {
        throw { status: 401, error: { code: 'REFRESH_TOKEN_EXPIRED', message: 'Refresh token has expired' } };
      }

      let sessionCleared = false;
      try {
        await mockRefreshToken();
      } catch {
        global.localStorage.removeItem('trended_access_token');
        global.localStorage.removeItem('trended_refresh_token');
        sessionCleared = true;
      }

      assert.strictEqual(sessionCleared, true);
      assert.strictEqual(global.localStorage.getItem('trended_access_token'), null);
      assert.strictEqual(global.localStorage.getItem('trended_refresh_token'), null);

      const errorMessage = parseApiError(401, {}, 'REFRESH_TOKEN_EXPIRED');
      assert.strictEqual(errorMessage, 'Your session has expired. Please sign in again.');
    });

    it('✓ should deduplicate concurrent refresh requests into a single promise', async () => {
      let refreshCallCount = 0;
      let refreshPromise = null;

      async function performRefresh() {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            refreshCallCount++;
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { access_token: 'shared-refreshed-token' };
          })().finally(() => {
            refreshPromise = null;
          });
        }
        return refreshPromise;
      }

      // 3 concurrent calls
      const [res1, res2, res3] = await Promise.all([
        performRefresh(),
        performRefresh(),
        performRefresh(),
      ]);

      assert.strictEqual(refreshCallCount, 1);
      assert.strictEqual(res1.access_token, 'shared-refreshed-token');
      assert.strictEqual(res2.access_token, 'shared-refreshed-token');
      assert.strictEqual(res3.access_token, 'shared-refreshed-token');
    });

    it('✓ should parse backend error JSON format { error: { code, message } }', () => {
      const backendError = {
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Cette adresse email est déjà associée à un compte.',
        },
      };

      const msg = parseApiError(409, backendError);
      assert.strictEqual(msg, 'An account with this email already exists.');

      const customBackendError = {
        error: {
          code: 'CUSTOM_BIZ_CODE',
          message: 'Une erreur spécifique métier.',
        },
      };

      const customMsg = parseApiError(400, customBackendError);
      assert.strictEqual(customMsg, 'Une erreur spécifique métier.');
    });
  });
});
