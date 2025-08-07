import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from 'firebase-admin/auth';
import { getAdminDb, adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export async function POST(request: NextRequest) {
  if (!googleClientId) {
    console.error("Google Client ID is not configured.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const googleClient = new OAuth2Client(googleClientId);

  try {
    const formData = await request.formData();
    const credential = formData.get('credential');

    if (typeof credential !== 'string') {
      return NextResponse.json({ error: 'Invalid credential provided.' }, { status: 400 });
    }

    // 1. Verify the token using Google's library.
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error('Invalid Google ID token.');
    }

    const { sub: uid, email, name, picture } = payload;
    const auth = getAdminAuth(adminApp);
    const db = getAdminDb();

    // 2. Create or update the user in Firebase Auth and Firestore
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
      await userRef.update({ 
        lastLogin: new Date().toISOString(),
        displayName: name,
        email: email,
       });
    }

    // 3. Create a session cookie for Firebase using the original credential
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(credential, { expiresIn });

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // 4. Redirect to the profile page on success
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/profile';
    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }
}
