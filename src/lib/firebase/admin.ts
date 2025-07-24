
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, getApp as getAdminApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminDb: Firestore | null = null;

const ADMIN_APP_NAME = 'firebase-admin-app-siren-singleton';

/**
 * Initializes the Firebase Admin SDK, handling both production and development environments.
 * - In a Google Cloud environment (like App Hosting), it uses Application Default Credentials.
 * - For local development, it uses service account credentials provided via environment variables.
 */
function initializeAdmin() {
  if (getAdminApps().some(app => app.name === ADMIN_APP_NAME)) {
    adminApp = getAdminApp(ADMIN_APP_NAME);
    adminDb = getFirestore(adminApp);
    return;
  }

  // Check for local development environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log("Initializing Firebase Admin SDK with service account credentials from environment variables.");
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines from the environment variable
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    
    adminApp = initializeAdminApp({
      credential: cert(serviceAccount)
    }, ADMIN_APP_NAME);

  } else {
    // Fallback for production environments (App Hosting, Cloud Run, etc.)
    // where Application Default Credentials are automatically available.
    console.log("Initializing Firebase Admin SDK with Application Default Credentials.");
    adminApp = initializeAdminApp(undefined, ADMIN_APP_NAME);
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
