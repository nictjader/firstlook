
import { type NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getAdminAuth, getAdminDb } from '../../../../lib/firebase/admin';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase-admin/firestore';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const oAuth2Client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(token: string) {
  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

// This function now primarily handles POST requests from the client-side popup flow.
export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credential not provided' }, { status: 400 });
    }

    const payload = await verifyGoogleToken(credential);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { sub: uid, email, name, picture } = payload;
    const adminAuth = await getAdminAuth();
    const adminDb = await getAdminDb();
    const userDocRef = doc(adminDb, 'users', uid);

    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      const newUserProfile = {
        userId: uid,
        email: email,
        displayName: name,
        photoUrl: picture,
        coins: 0,
        unlockedStories: [],
        readStories: [],
        favoriteStories: [],
        preferences: { subgenres: [] },
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserProfile);
    } else {
      await userDocRef.update({
        lastLogin: serverTimestamp(),
        displayName: name,
        photoUrl: picture,
      });
    }

    const customToken = await adminAuth.createCustomToken(uid);
    
    // Return the custom token in the JSON response
    return NextResponse.json({ token: customToken }, { status: 200 });

  } catch (error: any) {
    console.error('API Callback Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
