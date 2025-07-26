
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminDb: Firestore | null = null;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton';

function initializeAdmin() {
  const adminApps = getAdminApps();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (adminApps.some(app => app.name === ADMIN_APP_NAME)) {
    adminApp = getAdminApp(ADMIN_APP_NAME);
  } else {
    if (!projectId) {
      throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in environment variables.");
    }
    const appOptions: AppOptions = {
      projectId: projectId,
    };
    adminApp = initializeAdminApp(appOptions, ADMIN_APP_NAME);
  }

  adminDb = getFirestore(adminApp);
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeAdmin();
  }
  // The non-null assertion is safe here because initializeAdmin() will always set it.
  return adminDb!;
}
