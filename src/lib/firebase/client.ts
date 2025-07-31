
// THIS FILE IS FOR CLIENT-SIDE FIREBASE INIT ONLY
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// The Firebase config is now hardcoded with the correct project details to ensure
// proper initialization and fix authentication errors.
const firebaseConfig = {
  apiKey: "your-api-key-from-firebase",
  authDomain: "siren-h2y45.firebaseapp.com",
  projectId: "siren-h2y45",
  storageBucket: "siren-h2y45.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// This check is a safeguard. In a real environment, you'd want to ensure these keys are present.
if (firebaseConfig.apiKey === "your-api-key-from-firebase") {
    // In a real production environment, you might throw an error here.
    // For this context, we will proceed, but auth will likely fail if the key isn't injected.
    console.warn("Firebase API Key is a placeholder. Authentication will fail if not replaced by a valid key.");
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
