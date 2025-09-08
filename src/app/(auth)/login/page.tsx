
"use client";

import { Suspense, useEffect } from 'react';
import AuthForm from '../../../components/auth/auth-form';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../../../lib/firebase/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            // The onAuthStateChanged listener in auth-context will handle the redirect.
          })
          .catch((error) => {
            console.error("Failed to sign in with email link.", error);
          });
      }
    }
  }, []);

  if (authLoading || user) {
    return (
      <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Authenticating...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">
            Please wait while we sign you in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <AuthForm />;
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
