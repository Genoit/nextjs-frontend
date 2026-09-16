'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiRequestError } from './api';
import {
  completeGoogleRedirectSignIn,
  logoutFirebase,
  signInWithGoogle,
  startGoogleRedirectSignIn,
} from './firebase/auth';
import { AuthResponse, LoginPayload, RegisterPayload, User } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<AuthResponse>;
  loginWithGoogleRedirect: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'trended_access_token';
const GOOGLE_REDIRECT_FALLBACK_KEY = 'trended_google_redirect_fallback';

function shouldFallbackToGoogleRedirect(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  const code = String((error as { code?: string }).code ?? '');
  // Do NOT auto-redirect on popup-closed-by-user: that is an intentional user cancellation or aborted popup.
  // Auto-redirect ONLY when the browser popup blocker actively prevented the popup from opening.
  return code === 'auth/popup-blocked';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (storedToken) {
          setToken(storedToken);
          try {
            const currentUser = await api.getMe(storedToken);
            if (isMounted) setUser(currentUser);
          } catch (err) {
            if (err instanceof ApiRequestError && err.status === 401) {
              localStorage.removeItem(TOKEN_KEY);
              if (isMounted) {
                setToken(null);
                setUser(null);
              }
            }
          }
        }

        const redirectResult = await completeGoogleRedirectSignIn();
        sessionStorage.removeItem(GOOGLE_REDIRECT_FALLBACK_KEY);
        if (redirectResult && isMounted) {
          const data = await api.loginWithGoogle(redirectResult.idToken);
          localStorage.setItem(TOKEN_KEY, data.access_token);
          setToken(data.access_token);
          setUser(data.user);
          startTransition(() => {
            router.push('/dashboard');
          });
        }
      } catch (err) {
        console.error('Auth initialization / Google redirect failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await api.login(payload);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    try {
      const { idToken } = await signInWithGoogle();
      const data = await api.loginWithGoogle(idToken);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data;
    } catch (error) {
      const hasAlreadyTriedRedirect = sessionStorage.getItem(GOOGLE_REDIRECT_FALLBACK_KEY) === '1';
      if (shouldFallbackToGoogleRedirect(error) && !hasAlreadyTriedRedirect) {
        sessionStorage.setItem(GOOGLE_REDIRECT_FALLBACK_KEY, '1');
        await startGoogleRedirectSignIn();
      }
      throw error;
    }
  };

  const loginWithGoogleRedirect = async (): Promise<void> => {
    await startGoogleRedirectSignIn();
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    return api.register(payload);
  };

  const logout = () => {
    logoutFirebase().catch((err) => {
      console.error('Firebase sign out error:', err);
    });
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    startTransition(() => {
      router.push('/login');
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithGoogleRedirect,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
