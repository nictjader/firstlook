import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuth();
    const db = await getAdminDb();
    
    // In redirect mode, the credential is sent as form data
    const formData = await request.formData();
    const credential = formData.get('credential') as string;

    if (!credential) {
      console.error('Credential not found in form data');
      return NextResponse.redirect(new URL('/login?error=credential_missing', request.url));
    }

    const decodedToken = await adminAuth.verifyIdToken(credential);
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
        displayName: name, // Update name and picture on login
        photoUrl: picture,
      });
    }

    // This is the server-side step where we create a session cookie.
    // However, the current client-side setup uses token-based auth.
    // To bridge this, we will create a custom token and redirect the user
    // to a page that can consume it.
    const customToken = await adminAuth.createCustomToken(uid);
    
    // Redirect user to the login page with the token as a query param
    return NextResponse.redirect(new URL(`/login?token=${customToken}`, request.url));

  } catch (error: any) {
    console.error('Authentication callback error:', error);
    const errorMessage = encodeURIComponent(error.message || 'An unknown error occurred.');
    return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, request.url));
  }
}
