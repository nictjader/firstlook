// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminDb: Firestore | null = null;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton';

function initializeAdmin() {
  const adminApps = getAdminApps();
  if (adminApps.some(app => app.name === ADMIN_APP_NAME)) {
    adminApp = getAdminApp(ADMIN_APP_NAME);
    adminDb = getFirestore(adminApp);
    return;
  }

  // When running in a Google Cloud environment (like App Hosting),
  // the SDK will automatically find the default credentials.
  // Explicitly setting the projectId ensures it connects to the correct database,
  // which is especially helpful for local development with ADC.
  const appOptions: AppOptions = {
    projectId: 'siren-h2y45',
  };

  adminApp = initializeAdminApp(appOptions, ADMIN_APP_NAME);
  adminDb = getFirestore(adminApp);
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeAdmin();
  }
  // The non-null assertion is safe here because initializeAdmin() will always set it.
  return adminDb!;
}
