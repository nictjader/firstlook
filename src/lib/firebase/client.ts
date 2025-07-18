// THIS FILE IS FOR CLIENT-SIDE FIREBASE INIT ONLY
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// The Firebase config is hardcoded to ensure the client-side SDK is always initialized
// correctly, preventing the `400 Bad Request` errors seen in the logs.
const firebaseConfig = {
  apiKey: "CHANGEME",
  authDomain: "siren-h2y45.firebaseapp.com",
  projectId: "siren-h2y45",
  storageBucket: "siren-h2y45.appspot.com",
  messagingSenderId: "CHANGEME",
  appId: "CHANGEME",
  measurementId: "CHANGEME"
};


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
