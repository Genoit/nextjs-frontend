import { ApiRequestError } from './api';
import {
  isPopupBlockedError,
  isPopupClosedByUserError,
  isUnauthorizedDomainError,
} from './firebase/auth';

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * Maps any authentication or API error into a safe, user-friendly message.
 * Ensures no internal stack traces, tokens, passwords, or technical database errors are shown.
 */
export function getAuthErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.',
): string {
  if (!error) {
    return fallbackMessage;
  }

  // 1. API request error from FastAPI backend
  if (error instanceof ApiRequestError) {
    if (
      error.code === AUTH_ERROR_CODES.INVALID_CREDENTIALS ||
      (error.status === 401 &&
        (error.message.toLowerCase().includes('invalid email') ||
          error.message.toLowerCase().includes('password')))
    ) {
      return 'Invalid email or password.';
    }

    if (error.code === AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS || error.status === 409) {
      if (
        error.message.toLowerCase().includes('existing authentication method') ||
        error.message.toLowerCase().includes('already exists with this email')
      ) {
        return 'An account already exists with this email. Please sign in using your existing authentication method.';
      }
      return 'An account with this email already exists.';
    }

    if (
      error.code === AUTH_ERROR_CODES.ACCOUNT_INACTIVE ||
      (error.status === 403 && error.message.toLowerCase().includes('inactive'))
    ) {
      return 'This account is deactivated. Please contact support.';
    }

    if (
      error.code === AUTH_ERROR_CODES.TOKEN_EXPIRED ||
      error.code === AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED ||
      error.code === AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN ||
      (error.status === 401 && error.message.toLowerCase().includes('expired'))
    ) {
      return 'Your session has expired. Please sign in again.';
    }

    if (
      error.code === AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED ||
      (error.status === 401 && error.message.toLowerCase().includes('not authenticated'))
    ) {
      return 'Authentication required. Please sign in to continue.';
    }

    if (error.code === AUTH_ERROR_CODES.INVALID_TOKEN) {
      return 'Invalid session. Please sign in again.';
    }

    if (error.status === 422 || error.code === AUTH_ERROR_CODES.VALIDATION_ERROR) {
      if (error.message && !error.message.startsWith('Request failed')) {
        return error.message;
      }
      return 'Please verify the information you entered and try again.';
    }

    if (error.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }

    if (error.message && !error.message.startsWith('Request failed')) {
      return error.message;
    }

    return fallbackMessage;
  }

  // 2. Firebase Google Authentication errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code?: string }).code ?? '');

    if (isPopupBlockedError(error)) {
      return 'Google sign-in popup was blocked or interrupted. Click below to sign in with page redirect.';
    }

    if (isPopupClosedByUserError(error)) {
      return 'Google sign-in was cancelled.';
    }

    if (code === 'auth/web-storage-unsupported') {
      return 'Third-party cookies or storage access is disabled by your browser settings. Click below to sign in with page redirect.';
    }

    if (isUnauthorizedDomainError(error)) {
      return 'This domain is not authorized in Firebase Console. Please add your domain to authorized domains.';
    }

    if (code === 'auth/network-request-failed') {
      return 'Network error connecting to Google. Please check your internet connection.';
    }

    if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
      return 'Google sign-in is not configured correctly in Firebase. Please check your settings.';
    }

    return 'Google sign-in failed. Please try again.';
  }

  // 3. Browser Network / Fetch errors
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network error')
    ) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
  }

  return fallbackMessage;
}
