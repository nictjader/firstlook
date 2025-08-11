
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Helper function to get the correct public origin
function getPublicOrigin(request: NextRequest): string {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
    }
    // Fallback for local development or direct connections
    return request.nextUrl.origin;
}

async function handleAuth(request: NextRequest) {
    if (!googleClientId) {
        console.error("Server Error: Google Client ID is not configured.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const googleClient = new OAuth2Client(googleClientId);
    const publicOrigin = getPublicOrigin(request);

    try {
        const formData = await request.formData();
        const credential = formData.get('credential');

        if (typeof credential !== 'string') {
            throw new Error('Invalid credential provided.');
        }

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
            await userRef.update({ lastLogin: new Date().toISOString() });
        }

        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await auth.createSessionCookie(credential, { expiresIn });

        cookies().set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        const redirectUrl = new URL('/profile', publicOrigin);
        return NextResponse.redirect(redirectUrl);

    } catch (error: any) {
        console.error('Google Sign-In Error:', error.message);
        const loginUrl = new URL('/login', publicOrigin);
        loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
        return NextResponse.redirect(loginUrl.toString());
    }
}


// Handle the POST request from Google's redirect
export async function POST(request: NextRequest) {
    return handleAuth(request);
}

// Handle GET requests gracefully in case a user navigates here directly
export async function GET(request: NextRequest) {
    const publicOrigin = getPublicOrigin(request);
    const loginUrl = new URL('/login', publicOrigin);
    loginUrl.searchParams.set('error', 'Invalid sign-in method. Please try again.');
    return NextResponse.redirect(loginUrl);
}
