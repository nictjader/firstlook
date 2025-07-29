
// THIS FILE IS FOR CLIENT-SIDE FIREBASE INIT ONLY
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// The Firebase config is pulled from environment variables.
// These are set in the hosting environment and are available publicly on the client.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "siren-h2y45",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Throw an error if the project ID is not set, to prevent connecting to the wrong project.
if (!firebaseConfig.projectId) {
  throw new Error("Firebase project ID is not configured. Please check your environment variables.");
}

// Initialize Firebase for the CLIENT
let app: FirebaseApp;
if (!getApps().length) {
  // If no app is initialized, create one.
  app = initializeApp(firebaseConfig);
} else {
  // Otherwise, use the existing app.
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, db, storage, functions };
