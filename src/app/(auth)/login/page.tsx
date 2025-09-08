
"use client";

import { Suspense, useEffect, useState } from 'react';
import AuthForm from '../../../components/auth/auth-form';
import { Loader2 } from 'lucide-react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../../../lib/firebase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { useToast } from '../../../hooks/use-toast';

function LoginContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State to track if we are actively processing an email link sign-in.
  const [isHandlingEmailLink, setIsHandlingEmailLink] = useState(true);

  // This effect runs only once to check for an email sign-in link in the URL.
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
            // Success! The onAuthStateChanged listener in the context will now take over.
          })
          .catch((error) => {
            console.error("Error signing in with email link:", error);
            toast({
              title: "Sign-In Failed",
              description: error.message || "The sign-in link is invalid or has expired.",
              variant: "destructive"
            });
            setIsHandlingEmailLink(false); // Stop loading on error
          });
      } else {
        // User cancelled the prompt
        toast({ title: "Email Required", description: "Your email is needed to complete the sign-in.", variant: "destructive" });
        setIsHandlingEmailLink(false);
      }
    } else {
      // Not an email link sign-in, so we are done with this check.
      setIsHandlingEmailLink(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount.

  // This effect handles redirecting the user once they are authenticated.
  useEffect(() => {
    // If auth is no longer loading AND we have a user object...
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  // Show a loading spinner for all "in-between" states:
  // 1. The auth context is initially loading.
  // 2. We are processing an email link.
  // 3. We have a user and are about to redirect.
  if (authLoading || isHandlingEmailLink || user) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only if all loading is done and there's no user, show the sign-in form.
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
