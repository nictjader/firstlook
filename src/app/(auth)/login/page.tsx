
'use client';

import { Suspense, useEffect } from 'react';
import AuthForm from '../../components/auth/auth-form';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { auth } from '../../lib/firebase/client';
import { isSignInWithEmailLink, signInWithEmailLink, signInWithCustomToken } from 'firebase/auth';
import { useToast } from '../../hooks/use-toast';
import { Card } from '../../components/ui/card';

function LoginContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles the completion of the email link sign-in
    const completeEmailSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            // The onAuthStateChanged listener in AuthProvider will handle the redirect
          } catch (error) {
            console.error("Error signing in with email link:", error);
            toast({
              title: "Sign-In Failed",
              description: "The sign-in link is invalid or has expired. Please try again.",
              variant: "destructive"
            });
          } finally {
             window.localStorage.removeItem('emailForSignIn');
          }
        }
      }
    };

    // This effect handles the server-side callback after a Google Sign-In.
    // The backend will redirect here with a token in the URL query parameters.
    const completeGoogleSignIn = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Sign-In Failed",
          description: decodeURIComponent(error),
          variant: "destructive"
        });
        // Clean up the URL
        router.replace('/login', { scroll: false });
      } else if (token) {
        try {
          await signInWithCustomToken(auth, token);
          // onAuthStateChanged in AuthProvider will handle the redirect.
        } catch (e) {
          console.error("Failed to sign in with custom token", e);
          toast({
            title: "Sign-In Failed",
            description: "There was a problem signing you in. Please try again.",
            variant: "destructive"
          });
          router.replace('/login', { scroll: false });
        }
      }
    };
    
    completeEmailSignIn();
    completeGoogleSignIn();

  }, [toast, router, searchParams]);

  useEffect(() => {
    // This effect handles redirecting an already logged-in user
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  if (authLoading || user) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Signing in...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
        <AuthForm />
    </div>
  );
}


export default function LoginPage() {
  return (
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <LoginContent />
      </Suspense>
  );
}
