
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp, getApps, App, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';


// IMPORTANT: This initialization logic is designed to work in a serverless environment.
// It checks if an app is already initialized to prevent re-initialization on hot reloads.
// It uses environment variables for configuration, which is the standard and secure way.
function initializeAdmin() {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    
    // The service account is automatically available in the App Hosting environment.
    // No need to manage JSON files.
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
        throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in the environment.");
    }

    return initializeApp({
        projectId: projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
}

const adminApp = initializeAdmin();

export function getAdminDb(): Firestore {
  return getFirestore(adminApp);
}

export function getAdminAuth(): Auth {
  return getAuth(adminApp);
}

export { adminApp };
