
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
    try {
        enableIndexedDbPersistence(db);
    } catch (err: any) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one.
            // Silently fail.
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence.
            console.warn('Firestore persistence is not supported in this browser.');
        }
    }
}


export { app, auth, db, storage };
