
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Helper function to get the correct public origin
function getPublicOrigin(request: NextRequest): string {
  // Method 1: Check for custom header set by your frontend (most reliable)
  const customOrigin = request.headers.get('x-origin');
  if (customOrigin) {
    return customOrigin;
  }

  // Method 2: Check for forwarded headers (good for reverse proxies)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Method 3: Parse from referer header (reliable fallback)
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.origin;
    } catch (e) {
      console.warn('Failed to parse referer URL:', referer);
    }
  }

  // Method 4: Environment-based detection
  const host = request.headers.get('host');
  if (host) {
    // Check if it's production
    if (host.includes('tryfirstlook.com')) {
      return 'https://tryfirstlook.com';
    }
    // Check if it's staging (Firebase workstation)
    if (host.includes('firebase-studio') || host.includes('cloudworkstations.dev')) {
      return `https://${host}`;
    }
    // For localhost development
    if (host.includes('localhost')) {
      return `http://${host}`;
    }
  }

  // Method 5: Environment variable fallback
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Last resort fallback
  console.warn('Using request origin as fallback - this may cause redirect issues');
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
      secure: publicOrigin.startsWith('https://'),
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
