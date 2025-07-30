
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp;
let adminDb: Firestore;

const ADMIN_APP_NAME = 'firebase-admin-app-firstlook-singleton-v2';

if (!getAdminApps().some(app => app?.name === ADMIN_APP_NAME)) {
  const projectId = 'siren-h2y45';
  
  if (!projectId) {
    throw new Error("Critical: Project ID is not set.");
  }

  // Option 1: Using service account key (recommended for production)
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeAdminApp({
        credential: cert(serviceAccount),
        projectId: projectId,
      }, ADMIN_APP_NAME);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Initializing with default credentials.", e);
      adminApp = initializeAdminApp({ projectId: projectId }, ADMIN_APP_NAME);
    }
  } else {
    // Option 2: Using Application Default Credentials (for Cloud Run)
    adminApp = initializeAdminApp({
      projectId: projectId,
    }, ADMIN_APP_NAME);
  }
} else {
  adminApp = getAdminApp(ADMIN_APP_NAME);
}

adminDb = getFirestore(adminApp);

export function getAdminDb(): Firestore {
  return adminDb;
}
