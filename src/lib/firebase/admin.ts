
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp;
let adminDb: Firestore;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton';

if (!getAdminApps().some(app => app.name === ADMIN_APP_NAME)) {
    // When running in a Google Cloud environment (like App Hosting),
    // the SDK will automatically find the default credentials.
    // Explicitly setting the projectId ensures it connects to the correct database.
    adminApp = initializeAdminApp({
        projectId: 'siren-h2y45',
    }, ADMIN_APP_NAME);
} else {
    adminApp = getAdminApp(ADMIN_APP_NAME);
}

adminDb = getFirestore(adminApp);

export function getAdminDb(): Firestore {
  return adminDb;
}
