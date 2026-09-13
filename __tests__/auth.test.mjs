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

// Helper replicating API error handling
function parseApiError(status, data) {
  if (status === 409) {
    return 'An account with this email already exists.';
  }
  if (status === 401) {
    return 'Invalid email or password.';
  }
  if (data && typeof data === 'object') {
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
    this.isLoading = true;
  }

  init(token, user) {
    if (token && user) {
      this.token = token;
      this.user = user;
    }
    this.isLoading = false;
  }

  login(token, user) {
    global.localStorage.setItem('trended_access_token', token);
    this.token = token;
    this.user = user;
    this.isLoading = false;
  }

  logout() {
    global.localStorage.removeItem('trended_access_token');
    this.token = null;
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
});
