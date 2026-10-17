// ECE Connect — Firebase SDK Initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const cleanVal = (val) => {
  if (typeof val !== 'string') return val;
  return val.trim().replace(/^["']|["']$/g, '');
};

const firebaseConfig = {
  apiKey: cleanVal(env.VITE_FIREBASE_API_KEY) || "AIzaSyBDaOTi4TPUvZtjN1HQbB3uP_Nhyjjt0Jg",
  authDomain: cleanVal(env.VITE_FIREBASE_AUTH_DOMAIN) || "ece-connect-fcb2d.firebaseapp.com",
  projectId: cleanVal(env.VITE_FIREBASE_PROJECT_ID) || "ece-connect-fcb2d",
  storageBucket: cleanVal(env.VITE_FIREBASE_STORAGE_BUCKET) || "ece-connect-fcb2d.firebasestorage.app",
  messagingSenderId: cleanVal(env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "1064993589865",
  appId: cleanVal(env.VITE_FIREBASE_APP_ID) || "1:1064993589865:web:058105ea394fcea66870f8"
};

// Check if valid Firebase configuration has been provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your-firebase-api-key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id'
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
} else {
  console.warn(
    '[ECE Connect] Firebase credentials are not yet configured in .env.local / .env. ' +
    'The application will indicate that backend configuration is required.'
  );
}

export { app, auth, db, storage };
