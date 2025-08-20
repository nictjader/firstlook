
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// IMPORTANT: This initialization logic is designed to work in a serverless environment.
// It checks if an app is already initialized to prevent re-initialization on hot reloads.
// By not passing any credentials, the SDK will automatically use the project's
// service account credentials from the environment, which is the standard and secure way.
function initializeAdmin(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    
    // When no credentials are provided, the SDK uses the default application credentials
    // provided by the hosting environment.
    return initializeApp();
}

const adminApp: App = initializeAdmin();

export function getAdminDb(): Firestore {
  return getFirestore(adminApp);
}

export function getAdminAuth(): Auth {
  return getAuth(adminApp);
}

export { adminApp };
