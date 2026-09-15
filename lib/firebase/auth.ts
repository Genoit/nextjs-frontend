'use client';

import { signInWithPopup, signOut, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from './config';

export interface GoogleSignInResult {
  idToken: string;
  email: string | null;
  displayName: string | null;
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
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
  } catch (error) {
    console.error('signInWithGoogle error:', error);
    throw error;
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
