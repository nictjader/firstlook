import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, clientRedirectUri } = body;

    if (!credential || !credential.idToken) {
      return NextResponse.json({ error: 'Invalid credential provided.' }, { status: 400 });
    }
    
    if (!clientRedirectUri) {
        return NextResponse.json({ error: 'Client redirect URI is missing.' }, { status: 400 });
    }

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);
    
    // The idToken is what we need to verify the user and create a session.
    const idToken = credential.idToken;

    // The session cookie will be valid for 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    
    // Ensure user exists in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await auth.updateUser(uid, { email, displayName: name, photoURL: picture });
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
      await userRef.update({ 
          lastLogin: new Date().toISOString(),
          displayName: name,
          email: email,
        });
    }

    // Set the session cookie in the browser
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: new URL(clientRedirectUri).protocol === 'https:',
      path: '/',
    });

    // Use the client-provided URI to construct the final, correct redirect URL
    const redirectUrl = new URL('/profile', clientRedirectUri);
    return NextResponse.json({ success: true, redirectUrl: redirectUrl.toString() });

  } catch (error: any) {
    console.error('Server-side session creation error:', error);
    return NextResponse.json({ error: 'Server error during authentication.' }, { status: 500 });
  }
}
