
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, clientRedirectUri } = body;

    if (!credential || !credential.credential) {
      return NextResponse.json({ error: 'Invalid credential provided.' }, { status: 400 });
    }
    
    if (!clientRedirectUri) {
        return NextResponse.json({ error: 'Client redirect URI is missing.' }, { status: 400 });
    }

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);
    
    // The ID token is nested inside the credential object from Google
    const idToken = credential.credential;

    // Verify the ID token and get the user's UID.
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Set session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    // Create user profile in Firestore if it doesn't exist
    if (!userDoc.exists) {
      // Also ensure the user exists in Firebase Auth itself
      try {
        await auth.getUser(uid);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          await auth.createUser({ uid, email, displayName: name, photoURL: picture });
        } else {
          // Re-throw other auth errors
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
      // If user exists, just update their last login time and basic info
      await userRef.update({ 
          lastLogin: new Date().toISOString(),
          displayName: name,
          email: email,
        });
    }

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: new URL(clientRedirectUri).protocol === 'https:',
      path: '/',
      sameSite: 'lax',
    });

    const redirectUrl = new URL('/profile', clientRedirectUri);
    return NextResponse.json({ success: true, redirectUrl: redirectUrl.toString() });

  } catch (error: any) {
    console.error('Server-side session creation error:', error);
    const errorMessage = error.code === 'auth/id-token-expired' 
      ? 'Your session has expired. Please sign in again.'
      : 'Server error during authentication.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
