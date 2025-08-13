
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export async function POST(request: NextRequest) {
  // This function is now structured to handle errors gracefully without crashing.
  const getErrorRedirect = (message: string): NextResponse => {
      const host = request.headers.get('host');
      const protocol = host?.startsWith('localhost') ? 'http' : 'https';
      const appUrl = `${protocol}://${host}`;
      const loginUrl = new URL('/login', appUrl);
      loginUrl.searchParams.set('error', message);
      return NextResponse.redirect(loginUrl.toString());
  };

  if (!googleClientId) {
    console.error("Server Error: Google Client ID is not configured.");
    return getErrorRedirect('Server configuration error.');
  }

  try {
    const formData = await request.formData();
    const credential = formData.get('credential');

    if (typeof credential !== 'string') {
        return getErrorRedirect('Invalid credential provided.');
    }

    const googleClient = new OAuth2Client(googleClientId);
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
      // This block might still throw a permission error, which will be caught below.
      try {
        await auth.getUser(uid);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          await auth.createUser({ uid, email, displayName: name, photoURL: picture });
        } else {
          throw error; // Re-throw other auth errors to be caught by the outer catch.
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
      await userRef.update({ lastLogin: new Date().toISOString() });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(credential, { expiresIn });

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });
    
    // On success, reliably redirect to the profile page.
    const appUrl = request.nextUrl.origin;
    const redirectUrl = new URL('/profile', appUrl);
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('Google Sign-In Error:', error.message || error);
    // Use the reliable error redirect function.
    return getErrorRedirect('Authentication failed. Please try again.');
  }
}
