
import { type NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getAdminAuth, getAdminDb } from '../../../../../lib/firebase/admin';
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

// This function handles both POST requests from the GSI HTML API 
// and GET requests for redirects.
export async function GET(req: NextRequest) {
  return handleRequest(req);
}
export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  try {
    let credential;
    
    // The base URL for redirects should be the origin of the request.
    const baseUrl = req.nextUrl.origin;
    const loginUrl = new URL('/login', baseUrl);

    if (req.method === 'POST') {
      const formData = await req.formData();
      credential = formData.get('credential') as string | null;
    } else { // GET
      loginUrl.searchParams.set('error', 'Invalid+request+method');
      return NextResponse.redirect(loginUrl);
    }


    if (!credential) {
      const errorMsg = 'Credential not provided';
      console.error(`API Callback Error: ${errorMsg}`);
      loginUrl.searchParams.set('error', errorMsg);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyGoogleToken(credential);
    if (!payload) {
      const errorMsg = 'Invalid Google token';
      console.error(`API Callback Error: ${errorMsg}`);
      loginUrl.searchParams.set('error', errorMsg);
      return NextResponse.redirect(loginUrl);
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
    
    // Redirect back to the login page with the token
    loginUrl.searchParams.set('token', customToken);
    return NextResponse.redirect(loginUrl);

  } catch (error: any) {
    console.error('API Callback Error:', error);
    // Ensure we redirect to a fully qualified URL in case of a crash
    const baseUrl = req.nextUrl.origin || 'http://localhost:3000'; 
    const errorRedirectUrl = new URL('/login', baseUrl);
    errorRedirectUrl.searchParams.set('error', 'Internal+Server+Error');
    return NextResponse.redirect(errorRedirectUrl);
  }
}
