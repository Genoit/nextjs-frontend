'use client';

import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, GoogleAuthProvider, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

function getFirebase() {
  if (typeof window === 'undefined') {
    return {
      app: null as unknown as FirebaseApp,
      auth: null as unknown as Auth,
      googleProvider: null as unknown as GoogleAuthProvider,
    };
  }

  const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth: Auth = getAuth(app);
  const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  return { app, auth, googleProvider };
}

const fb = getFirebase();

export const app: FirebaseApp = fb.app;
export const auth: Auth = fb.auth;
export const googleProvider: GoogleAuthProvider = fb.googleProvider;
