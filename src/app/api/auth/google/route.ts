
import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from 'firebase-admin/auth';
import { getAdminDb, adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

// Initialize the Google Auth client
const googleClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const credential = formData.get('credential');

    if (typeof credential !== 'string') {
      return NextResponse.json({ error: 'Invalid credential provided.' }, { status: 400 });
    }

    // 1. Verify the token using Google's library. This is the most reliable method.
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error('Invalid Google ID token.');
    }
    
    // Using the 'sub' field from Google's payload as the UID is standard practice.
    const { sub: uid, email, name, picture } = payload;
    const auth = getAdminAuth(adminApp);
    const db = getAdminDb();

    // 2. Create or update the user in Firebase Auth and Firestore
    // This uses the verified information from Google.
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If user does not exist in Firestore, create them in Auth and Firestore
      try {
        await auth.createUser({ uid, email, displayName: name, photoURL: picture });
      } catch (error: any) {
        // This handles the edge case where a user might exist in Firebase Auth
        // but not in Firestore. If the error is 'auth/uid-already-exists',
        // we can safely proceed.
        if (error.code !== 'auth/uid-already-exists') {
          throw error;
        }
      }
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
      // If user exists, just update their last login time and details
      await userRef.update({ 
          lastLogin: new Date().toISOString(),
          displayName: name,
          email: email,
      });
    }

    // 3. Create a session cookie for Firebase on the client-side
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(credential, { expiresIn });

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // 4. Redirect to the profile page on success
    return NextResponse.redirect(new URL('/profile', request.url));

  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }
}
