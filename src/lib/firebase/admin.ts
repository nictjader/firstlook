
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminDb: Firestore | null = null;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton';

function initializeAdmin() {
  const adminApps = getAdminApps();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'siren-h2y45';
  
  if (adminApps.some(app => app.name === ADMIN_APP_NAME)) {
    adminApp = getAdminApp(ADMIN_APP_NAME);
  } else {
    // When running in a Google Cloud environment (like App Hosting),
    // the SDK will automatically find the default credentials.
    // However, explicitly providing the projectId makes the initialization more robust.
    const appOptions: AppOptions = {
      projectId: projectId,
    };
    adminApp = initializeAdminApp(appOptions, ADMIN_APP_NAME);
  }

  // Explicitly passing the adminApp instance to getFirestore ensures
  // it uses the correct, explicitly configured app context.
  adminDb = getFirestore(adminApp);
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeAdmin();
  }
  // The non-null assertion is safe here because initializeAdmin() will always set it.
  return adminDb!;
}
