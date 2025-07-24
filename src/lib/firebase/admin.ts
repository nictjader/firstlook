// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminDb: Firestore | null = null;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton';

function initializeAdmin() {
  const adminApps = getAdminApps();
  const projectId = 'siren-h2y45';
  
  if (adminApps.some(app => app.name === ADMIN_APP_NAME)) {
    adminApp = getAdminApp(ADMIN_APP_NAME);
  } else {
    // When running in a Google Cloud environment (like App Hosting),
    // the SDK will automatically find the default credentials.
    const appOptions: AppOptions = {
      projectId: projectId,
    };
    adminApp = initializeAdminApp(appOptions, ADMIN_APP_NAME);
  }

  // Explicitly passing the projectId to getFirestore can resolve
  // connection issues in environments with complex permission setups.
  adminDb = getFirestore(adminApp);
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeAdmin();
  }
  // The non-null assertion is safe here because initializeAdmin() will always set it.
  return adminDb!;
}
