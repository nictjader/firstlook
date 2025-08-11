import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

// Get the environment variables
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

async function handleAuth(request: NextRequest) {
    // Check for required configuration
    if (!googleClientId || !appUrl) {
        console.error("Server Error: Google Client ID or App URL is not configured.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const googleClient = new OAuth2Client(googleClientId);

    try {
        const formData = await request.formData();
        const credential = formData.get('credential');
        if (typeof credential !== 'string') {
            throw new Error('Invalid credential provided.');
        }

        // Verify the token from Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid Google ID token.');
        }

        const { sub: uid, email, name, picture } = payload;
        const auth = getAuth(adminApp);
        const db = getFirestore(adminApp);

        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        // Create user in Firestore and Firebase Auth if they don't exist
        if (!userDoc.exists) {
            await auth.createUser({ uid, email, displayName: name, photoURL: picture });
            await userRef.set({
                userId: uid,
                email: email,
                displayName: name,
                coins: 0,
                unlockedStories: [],
                readStories: [],
                favoriteStories: [],
                preferences: { subgenres: [] },
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                stripeCustomerId: null,
            });
        } else {
            // Otherwise, just update their last login time
            await userRef.update({ lastLogin: new Date().toISOString() });
        }

        // Create a session cookie
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await auth.createSessionCookie(credential, { expiresIn });
        cookies().set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: new URL(appUrl).protocol === 'https:',
            path: '/',
        });

        // Redirect to the profile page on success
        const redirectUrl = new URL('/profile', appUrl);
        return NextResponse.redirect(redirectUrl);

    } catch (error: any) {
        console.error('Google Sign-In Error:', error.message);
        const loginUrl = new URL('/login', appUrl);
        loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
        return NextResponse.redirect(loginUrl.toString());
    }
}

// Handle the POST request from Google's redirect
export async function POST(request: NextRequest) {
    return handleAuth(request);
}

// Handle GET requests gracefully by redirecting to the login page
export async function GET(request: NextRequest) {
    if (!appUrl) {
        return NextResponse.json({ error: 'Server configuration error: App URL is missing.' }, { status: 500 });
    }
    const loginUrl = new URL('/login', appUrl);
    loginUrl.searchParams.set('error', 'Invalid sign-in method. Please try again.');
    return NextResponse.redirect(loginUrl);
}
