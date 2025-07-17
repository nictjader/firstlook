
// THIS FILE IS FOR CLIENT-SIDE FIREBASE INIT ONLY
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// NOTE: Using hardcoded values as environment variables are not being picked up correctly in the execution environment.
const firebaseConfig = {
    apiKey: "CHANGEME",
    authDomain: "siren-h2y45.firebaseapp.com",
    projectId: "siren-h2y45",
    storageBucket: "siren-h2y45.appspot.com",
    messagingSenderId: "565398696245",
    appId: "1:565398696245:web:e003423ba0199e3a6a9b40",
    measurementId: "G-J03V624R60",
};

// Initialize Firebase for the CLIENT
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, db, storage, functions };

