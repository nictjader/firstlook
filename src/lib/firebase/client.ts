// THIS FILE IS FOR CLIENT-SIDE FIREBASE INIT ONLY
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// The Firebase config is pulled from environment variables.
// These are set in the hosting environment and are available publicly on the client.
const firebaseConfig = {
  apiKey: "AIzaSyDktjQE-xzmELp3BVVJM6XsqpnDhs2JGKs",
  authDomain: "siren-h2y45.firebaseapp.com",
  projectId: "siren-h2y45",
  storageBucket: "siren-h2y45.firebasestorage.app",
  messagingSenderId: "958286415810",
  appId: "1:958286415810:web:80fe78a273eb909dd8785b",
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
