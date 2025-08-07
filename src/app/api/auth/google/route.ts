
import { type NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin-config';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const credential = formData.get('credential');

    if (typeof credential !== 'string') {
      return NextResponse.json({ error: 'Invalid credential' }, { status: 400 });
    }

    const auth = getAdminAuth();
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

    return NextResponse.redirect(new URL('/profile', request.url));

  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
