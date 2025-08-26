
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp, getApps, App, cert, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;
let adminAppPromise: Promise<App>;

// This simplified initialization is the standard and correct way for App Hosting.
// It automatically finds the project's service account credentials from the environment.
if (getApps().length === 0) {
  adminApp = initializeApp();
  adminAppPromise = Promise.resolve(adminApp);
} else {
  adminApp = getApps()[0];
  adminAppPromise = Promise.resolve(adminApp);
}


// We must export functions that await the promise to ensure initialization is complete.
const getAdminDb = async (): Promise<Firestore> => {
    const app = await adminAppPromise;
    return getFirestore(app);
};

const getAdminAuth = async (): Promise<Auth> => {
    const app = await adminAppPromise;
    return getAuth(app);
};

const getAdminStorage = async (): Promise<any> => {
    const app = await adminAppPromise;
    return getStorage(app);
};

export { adminAppPromise, getAdminDb, getAdminAuth, getAdminStorage };
