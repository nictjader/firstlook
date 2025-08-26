
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp, getApps, App, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// IMPORTANT: This initialization logic is designed to work in a serverless environment
// like Firebase App Hosting. It checks if an app is already initialized to prevent
// errors during hot-reloads in development.
function initializeAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    
    // When running in a Google Cloud environment (like App Hosting), the SDK
    // will automatically detect the project's service account credentials.
    // No explicit configuration is needed.
    return initializeApp();
}

const adminApp: App = initializeAdmin();
const adminDb: Firestore = getFirestore(adminApp);
const adminAuth: Auth = getAuth(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminDb as getAdminDb, adminAuth as getAdminAuth, adminStorage as getAdminStorage };
