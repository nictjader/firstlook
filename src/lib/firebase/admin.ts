
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp;
let adminDb: Firestore;

const ADMIN_APP_NAME = 'firebase-admin-app-firstlook-singleton-v2';

// Simplified initialization using Application Default Credentials.
// This is the standard and recommended way for services running on Google Cloud.
if (!getAdminApps().some(app => app?.name === ADMIN_APP_NAME)) {
  const projectId = 'siren-h2y45';
  
  if (!projectId) {
    throw new Error("Critical: Project ID is not set.");
  }
  
  // This will automatically use the service account associated with the App Hosting backend.
  // No need to manage service account keys in environment variables.
  adminApp = initializeAdminApp({ projectId: projectId }, ADMIN_APP_NAME);

} else {
  adminApp = getAdminApp(ADMIN_APP_NAME);
}

adminDb = getFirestore(adminApp);

export function getAdminDb(): Firestore {
  return adminDb;
}
