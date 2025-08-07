
import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from 'firebase-admin/auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { adminApp } from '@/lib/firebase/admin';

// This is a new file that handles the server-side Google Sign-In flow.
// It receives the credential from the GSI button, verifies it, creates a user profile
// if one doesn't exist, and sets a session cookie for the user.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const credential = formData.get('credential');

    if (typeof credential !== 'string') {
      return NextResponse.json({ error: 'Invalid credential' }, { status: 400 });
    }
    
    // Ensure the Firebase Admin app is initialized
    const auth = getAdminAuth(adminApp);
    const db = getAdminDb();

    // Verify the ID token from Google
    const decodedToken = await auth.verifyIdToken(credential);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If user does not exist, create a new user profile in Firestore
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
      }, { merge: true });
    } else {
      // If user exists, update last login and other details
      await userRef.update({
        lastLogin: new Date().toISOString(),
        displayName: name,
        email: email,
      });
    }
    
    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(credential, { expiresIn });

    // Set the cookie on the response
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // Redirect the user to their profile page after successful sign-in
    return NextResponse.redirect(new URL('/profile', request.url));

  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    // Redirect to the login page with an error message
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'Authentication failed. Please try again.')
    return NextResponse.redirect(loginUrl);
  }
}
