"use client";

import { Suspense, useEffect, useState } from 'react';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/header';
import { getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// This page must be dynamic because it handles authentication redirects and
// relies on client-side state.
export const dynamic = 'force-dynamic';


function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        // This is the critical part: handling the redirect result.
        if (result && result.user) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential) {
            const clientRedirectUri = sessionStorage.getItem('clientRedirectUri');
            if (!clientRedirectUri) {
              throw new Error("Client redirect URI not found in session storage.");
            }

            // Send the credential and client origin to our dedicated API route
            const response = await fetch('/api/auth/verify-and-sign-in', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential, clientRedirectUri }),
            });

            const data = await response.json();

            if (response.ok && data.redirectUrl) {
              // The server has verified everything and told us where to go.
              router.push(data.redirectUrl);
            } else {
              throw new Error(data.error || 'Failed to verify session with server.');
            }
          }
        } else {
          // No redirect result, so we're just loading the login page normally.
          setIsVerifying(false);
        }
      } catch (error: any) {
        console.error("Error processing auth redirect:", error);
        let message = error.message || 'An unknown authentication error occurred.';
        if (error.code === 'auth/account-exists-with-different-credential') {
          message = 'An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.';
        }
        setAuthError(message);
        setIsVerifying(false);
      }
    };

    processRedirect();
    
    // Also check for errors passed in URL params from previous failed attempts
    const errorParam = searchParams.get('error');
    if (errorParam && !authError) {
      setAuthError(errorParam);
    }

  }, [router, toast, searchParams, authError]);
  
  if (isVerifying) {
    return (
      <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <h3 className="text-2xl font-semibold tracking-tight">Verifying...</h3>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">
            Please wait while we complete the sign-in process.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      <AuthForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
        <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-md">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <Suspense>
          <LoginContent />
        </Suspense>
      </main>
    </div>
  );
}
