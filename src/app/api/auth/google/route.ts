
  import { type NextRequest, NextResponse } from 'next/server';
  import { getAuth } from 'firebase-admin/auth';
  import { getFirestore } from 'firebase-admin/firestore';
  import { adminApp } from '@/lib/firebase/admin';
  import { cookies } from 'next/headers';

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6000').replace(/\/$/, '');

  async function handleAuth(request: NextRequest) {
    if (!appUrl) {
      console.error("Server Error: App URL is not configured.");
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    try {
      const { idToken } = await request.json();
      if (!idToken) {
        throw new Error('No ID token provided.');
      }

      const auth = getAuth(adminApp);
      const decodedToken = await auth.verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;
      const db = getFirestore(adminApp);

      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await auth.createUser({ uid, email, displayName: name, photoURL: picture });
        await userRef.set({
          userId: uid,
          email,
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
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      cookies().set('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax', // Optional: Adjust based on your needs
      });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Google Sign-In Error:', error.message);
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 400 });
    }
  }

  export async function POST(request: NextRequest) {
    return handleAuth(request);
  }
  