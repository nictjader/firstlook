// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Debugging environment variables
console.log('Project ID from env:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Firebase related env vars:', Object.keys(process.env).filter(key => key.includes('FIREBASE')));


let adminApp: AdminApp;
let adminDb: Firestore;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton-v2';

if (!getAdminApps().some(app => app?.name === ADMIN_APP_NAME)) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error("Critical: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in environment variables.");
  }

  // Option 1: Using service account key (recommended for production)
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    console.log("Initializing Admin SDK with Service Account Key.");
    adminApp = initializeAdminApp({
      credential: cert(JSON.parse(serviceAccountKey)),
      projectId: projectId,
    }, ADMIN_APP_NAME);
  } else {
    // Option 2: Using Application Default Credentials (for Cloud Run)
    console.log("Initializing Admin SDK with Application Default Credentials.");
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
