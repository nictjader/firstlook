// This file is intentionally left empty. 
// The new authentication flow does not use this endpoint for server-side
// token verification. The logic has been moved to a new, more specific route
// at /api/auth/verify-and-sign-in to improve clarity and robustness.
// Keeping this file prevents potential 404 errors if old clients or
// search engines try to access it.

import { NextResponse } from 'next/server';

export async function GET() {
    // Redirect to the login page with an informative error.
    const loginUrl = new URL('/login', 'http://localhost:3000'); // Base URL doesn't matter much here
    loginUrl.searchParams.set('error', 'This sign-in method is outdated. Please try again.');
    return NextResponse.redirect(loginUrl, 302);
}

export async function POST() {
     // Redirect to the login page with an informative error.
    const loginUrl = new URL('/login', 'http://localhost:3000');
    loginUrl.searchParams.set('error', 'This sign-in method is outdated. Please try again.');
    return NextResponse.redirect(loginUrl, 302);
}
