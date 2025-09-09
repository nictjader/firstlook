import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuth();
    const db = await getAdminDb();
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credential not provided' }, { status: 400 });
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
        displayName: name,
        photoUrl: picture,
      });
    }

    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ token: customToken });

  } catch (error: any) {
    console.error('Authentication callback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
