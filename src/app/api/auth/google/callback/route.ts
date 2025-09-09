import { type NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase-admin/firestore';

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

// This function handles the POST request from Google's redirect.
export async function POST(req: NextRequest) {
  const loginPageUrl = new URL('/login', req.nextUrl.origin);

  try {
    const formData = await req.formData();
    const credential = formData.get('credential')?.toString();

    if (!credential) {
      loginPageUrl.searchParams.set('error', 'Credential not provided');
      return NextResponse.redirect(loginPageUrl);
    }
    
    const payload = await verifyGoogleToken(credential);
    if (!payload) {
      loginPageUrl.searchParams.set('error', 'Invalid Google token');
      return NextResponse.redirect(loginPageUrl);
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
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        displayName: name,
        photoUrl: picture,
      });
    }

    const customToken = await adminAuth.createCustomToken(uid);
    
    // Redirect back to the login page with the custom token
    loginPageUrl.searchParams.set('token', customToken);
    return NextResponse.redirect(loginPageUrl);

  } catch (error: any) {
    console.error('API Callback Error:', error);
    loginPageUrl.searchParams.set('error', 'Internal Server Error');
    return NextResponse.redirect(loginPageUrl);
  }
}
