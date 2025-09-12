'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { OAuth2Client } from 'google-auth-library';

// This is the server-side client ID, which should be kept secret.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credential not provided' }, { status: 400 });
    }

    // 1. Verify the Google ID token using Google's library.
    // This is the crucial step that fixes the 'aud' claim error.
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
        return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { sub: uid, email, name, picture } = payload;
    const adminAuth = await getAdminAuth();
    const db = await getAdminDb();
    
    // 2. Create or update the user in Firestore.
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      await userDocRef.set({
        userId: uid,
        email: email,
        displayName: name,
        photoURL: picture,
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
      });
    }

    // 3. Create a custom Firebase token for the client to sign in with.
    const customToken = await adminAuth.createCustomToken(uid);

    // 4. Return the custom token to the client.
    return NextResponse.json({ token: customToken });

  } catch (error: any) {
    console.error('Authentication callback error:', error);
    return NextResponse.json({ error: 'Authentication failed', details: error.message }, { status: 500 });
  }
}
