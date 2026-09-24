'use client';

import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from './config';

export interface GoogleSignInResult {
  idToken: string;
  email: string | null;
  displayName: string | null;
}

export function isPopupBlockedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: string }).code ?? '') : '';
  const message = 'message' in error ? String((error as { message?: string }).message ?? '') : '';

  return code === 'auth/popup-blocked' || message.toLowerCase().includes('popup-blocked');
}

export function isPopupClosedByUserError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: string }).code ?? '') : '';
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not available.');
  }

  const result: UserCredential = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    email: result.user.email,
    displayName: result.user.displayName,
  };
}

export async function startGoogleRedirectSignIn(): Promise<void> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not available.');
  }

  await signInWithRedirect(auth, googleProvider);
}

export async function completeGoogleRedirectSignIn(): Promise<GoogleSignInResult | null> {
  if (!auth) {
    return null;
  }

  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      return null;
    }

    const idToken = await result.user.getIdToken();
    return {
      idToken,
      email: result.user.email,
      displayName: result.user.displayName,
    };
  } catch (error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    if (code === 'auth/web-storage-unsupported') {
      console.warn('Firebase web storage unsupported in this browser environment:', error);
      return null;
    }
    console.warn('completeGoogleRedirectSignIn notice:', error);
    return null;
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Error signing out from Firebase:', error);
  }
}
