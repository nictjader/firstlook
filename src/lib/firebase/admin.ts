
// THIS FILE IS FOR SERVER-SIDE FIREBASE INIT ONLY

import { initializeApp, getApps, App, cert, type AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { GoogleAuth } from 'google-auth-library';

let adminApp: App;
let adminAppPromise: Promise<App>;

async function initializeAdminApp(): Promise<App> {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // When running in a Google Cloud environment (like App Hosting),
    // the google-auth-library can automatically find the default service account credentials.
    const auth = new GoogleAuth({
        scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/datastore',
            'https://www.googleapis.com/auth/devstorage.full_control',
            'https://www.googleapis.com/auth/firebase',
            'https://www.googleapis.com/auth/identitytoolkit',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
    });

    const credential = {
        getAccessToken: async () => {
            const client = await auth.getClient();
            const accessToken = await client.getAccessToken();
            return {
                access_token: accessToken.token!,
                expires_in: accessToken.expires_in!,
            };
        },
    };
    
    // Initialize the app with the retrieved credentials.
    return initializeApp({
        credential: {
            getAccessToken: credential.getAccessToken,
        },
        // The SDK will automatically detect the project ID in the App Hosting environment.
        // We can also make it explicit for robustness.
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

adminAppPromise = initializeAdminApp();
adminAppPromise.then(app => {
    adminApp = app;
}).catch(console.error);

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
