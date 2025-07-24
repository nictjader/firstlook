// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminDb: Firestore | null = null;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton';

/**
 * Initializes the Firebase Admin SDK using a singleton pattern.
 * It relies on Application Default Credentials (ADC), which are automatically
 * available in Google Cloud environments like App Hosting (production) and should
 * be configured for local development environments (prototyper).
 */
function initializeAdmin() {
  if (getAdminApps().some(app => app.name === ADMIN_APP_NAME)) {
    adminApp = getAdminApp(ADMIN_APP_NAME);
    adminDb = getFirestore(adminApp);
    return;
  }

  // By calling initializeAdminApp() without arguments, the SDK uses ADC
  // to automatically find the service account credentials. This is the
  // most robust method for both production and properly-configured dev environments.
  adminApp = initializeAdminApp(undefined, ADMIN_APP_NAME);
  adminDb = getFirestore(adminApp);
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeAdmin();
  }
  // The non-null assertion is safe here because initializeAdmin() will always set it.
  return adminDb!;
}
