import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  try {
    const adminAuth = await getAdminAuth();
    const db = await getAdminDb();
    
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credential not provided' }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(credential, true);
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

    const customToken = await adminAuth.createCustomToken(uid);
    const response = NextResponse.json({ token: customToken });
    
    // Set CORS headers
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error: any) {
    console.error('Authentication callback error:', error);
    const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    return response;
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const response = new Response(null, { status: 204 });
  if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
