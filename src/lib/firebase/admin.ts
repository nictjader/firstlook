
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp;
let adminDb: Firestore;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton-v2';

// This is a more robust way to initialize the admin SDK in server environments.
// It ensures that we're always working with a single, named instance of the app.
if (!getAdminApps().some(app => app?.name === ADMIN_APP_NAME)) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("Critical: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in environment variables.");
  }
  
  adminApp = initializeAdminApp({
    projectId: projectId,
  }, ADMIN_APP_NAME);
} else {
  adminApp = getAdminApp(ADMIN_APP_NAME);
}

// Explicitly connect to the database with the ID '(default)'
// This bypasses any issues with the default service link being disabled or misconfigured.
adminDb = getFirestore(adminApp, '(default)');

export function getAdminDb(): Firestore {
  // adminDb is now guaranteed to be initialized by the time this is called.
  return adminDb;
}
