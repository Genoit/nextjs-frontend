import { signInWithPopup, signOut, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from './config';

export interface GoogleSignInResult {
  idToken: string;
  email: string | null;
  displayName: string | null;
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const result: UserCredential = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    email: result.user.email,
    displayName: result.user.displayName,
  };
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out from Firebase:', error);
  }
}
