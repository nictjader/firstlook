
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// **THE FIX:** This helper function reliably determines the base URL.
// It checks request headers that are standard in hosting environments like
// Firebase Hosting and Google Cloud Workstations.
const getBaseUrl = (request: NextRequest) => {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  if (!host) {
    // Fallback for local development if headers aren't set
    return request.nextUrl.origin;
  }
  return `${protocol}://${host}`;
};

export async function POST(request: NextRequest) {
  if (!googleClientId) {
    console.error("Server Error: Google Client ID is not configured.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const googleClient = new OAuth2Client(googleClientId);
  const baseUrl = getBaseUrl(request); // Use the reliable helper

  try {
    const formData = await request.formData();
    const credential = formData.get('credential');

    if (typeof credential !== 'string') {
      return NextResponse.json({ error: 'Invalid credential provided.' }, { status: 400 });
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

    // The success redirect is now built from the reliable base URL.
    const redirectUrl = new URL('/profile', baseUrl);
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('Google Sign-In Error:', error);

    // The error redirect is also built from the reliable base URL.
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }
}
