import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  try {
    const adminAuth = await getAdminAuth();
    const db = await getAdminDb();
    
    // The redirect flow sends the credential as form data.
    const formData = await request.formData();
    const credential = formData.get('credential') as string;

    if (!credential) {
      return NextResponse.redirect(new URL('/login?error=credential_missing', request.url));
    }

    const decodedToken = await adminAuth.verifyIdToken(credential, true); // Verify session cookie
    const { uid, email, name, picture } = decodedToken;

    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      await userDocRef.set({
        userId: uid,
        email: email,
        displayName: name,
        photoUrl: picture,
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
        coins: 0,
        unlockedStories: [],
        readStories: [],
        favoriteStories: [],
        preferences: { subgenres: [] },
      });
    } else {
      await userDocRef.update({
        lastLogin: FieldValue.serverTimestamp(),
        displayName: name,
        photoUrl: picture,
      });
    }

    // Instead of creating a custom token, we create a session cookie.
    const customToken = await adminAuth.createCustomToken(uid);
    const redirectUrl = origin ? new URL(origin) : new URL('/', request.url);
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('token', customToken);

    // Redirect the user back to the login page to complete client-side sign-in.
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('Authentication callback error:', error);
    const redirectUrl = origin ? new URL(origin) : new URL('/', request.url);
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(redirectUrl);
  }
}
