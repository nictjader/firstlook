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
  const { loading: authLoading, user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailLinkProcessed, setEmailLinkProcessed] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user && !emailLinkProcessed) {
      router.replace('/');
    }
  }, [user, authLoading, router, emailLinkProcessed]);

  useEffect(() => {
    // This effect runs when the page loads after a potential redirect.
    const processAuth = async () => {
      // Check for error parameters first
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setAuthError(decodeURIComponent(errorParam));
        setIsVerifying(false);
        router.replace('/login', { scroll: false }); 
        return;
      }

      // Check for email link sign-in specifically.
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setEmailLinkProcessed(true);
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            // Clean up the URL
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, document.title, url.toString());
            
            // The onAuthStateChanged listener will handle the redirect
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

    // Only process auth if the main auth context isn't still loading from a redirect
    if (!authLoading || isSignInWithEmailLink(auth, window.location.href)) {
      processAuth();
    } else {
      // If auth is loading (potentially from redirect), wait a bit then set verifying to false
      const timer = setTimeout(() => {
        setIsVerifying(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, router, searchParams]);

  // Show loading state while verifying or if auth is loading
  if (isVerifying || (authLoading && !emailLinkProcessed)) {
    return (
      <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {isSignInWithEmailLink(auth, window.location.href) 
              ? "Completing Email Sign-In..." 
              : "Finalizing Sign-In..."
            }
          </CardTitle>
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

  // If user is authenticated, show a brief success message while redirecting
  if (user && !emailLinkProcessed) {
    return (
      <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight text-green-600">
            Welcome Back!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">
            Redirecting you to the main page...
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
    