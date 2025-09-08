
"use client";

import { Suspense, useEffect, useState } from 'react';
import AuthForm from '../../../components/auth/auth-form';
import { Loader2, AlertCircle } from 'lucide-react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../../../lib/firebase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuth } from '../../../contexts/auth-context';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs when the page loads after a potential redirect.
    const processAuth = async () => {
      // Don't do anything if the main auth context is still loading,
      // as it might be handling a redirect result.
      if (authLoading) {
        return;
      }
      
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setAuthError(decodeURIComponent(errorParam));
        setIsVerifying(false);
        router.replace('/login', { scroll: false }); 
        return;
      }

      // Check for email link sign-in specifically.
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // The onAuthStateChanged listener in auth-context will handle the redirect.
          } catch (error: any) {
            console.error("Error signing in with email link:", error);
            setAuthError(error.message || "Failed to sign in with email link.");
          }
        } else {
          setAuthError("Email is required to complete sign-in.");
        }
      }
      
      setIsVerifying(false);
    };

    processAuth();
  }, [authLoading, router, searchParams]);

  // A more robust loading state that considers the main auth context
  if (isVerifying || authLoading) {
    return (
      <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Finalizing Sign-In...</CardTitle>
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
      <Suspense fallback={
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <LoginContent />
      </Suspense>
  );
}
