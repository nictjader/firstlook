import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Helper function to get the correct public origin
function getPublicOrigin(request: NextRequest): string {
  // The 'x-forwarded-proto' header is the most reliable source for the protocol.
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');

  if (forwardedProto && host) {
    // If we have both, we can construct the definitive public URL.
    return `${forwardedProto}://${host}`;
  }
  
  // Fallback for local development or environments without x-forwarded-proto.
  // This is less reliable in proxied environments but necessary as a backup.
  return request.nextUrl.origin;
}


// The Google Sign-In redirect flow uses a POST request to send the credential.
export async function POST(request: NextRequest) {
  if (!googleClientId) {
    console.error("Server Error: Google Client ID is not configured.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const googleClient = new OAuth2Client(googleClientId);
  const publicOrigin = getPublicOrigin(request);

  try {
    // In the redirect flow, the credential is in the form data of the POST request.
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
      secure: process.env.NODE_ENV === 'production' || publicOrigin.startsWith('https://'),
      path: '/',
    });
    
    const redirectUrl = new URL('/profile', publicOrigin);
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    
    const loginUrl = new URL('/login', publicOrigin);
    loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }
}

// Add a GET handler to prevent errors if the user navigates here directly.
export async function GET(request: NextRequest) {
    const publicOrigin = getPublicOrigin(request);
    const loginUrl = new URL('/login', publicOrigin);
    loginUrl.searchParams.set('error', 'Invalid sign-in attempt. Please try again from the login page.');
    return NextResponse.redirect(loginUrl);
}
