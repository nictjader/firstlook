
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp, getApps, App, cert, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;

// This simplified initialization is the standard and correct way for App Hosting.
// It automatically finds the project's service account credentials from the environment.
if (getApps().length === 0) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);


// We must export functions that await the promise to ensure initialization is complete.
const getAdminDb = async (): Promise<Firestore> => {
    return adminDb;
};

const getAdminAuth = async (): Promise<Auth> => {
    return adminAuth;
};

export { getAdminDb, getAdminAuth };

