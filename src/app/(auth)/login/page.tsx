'use client';

import { Suspense, useEffect, useState } from 'react';
import AuthForm from '../../../components/auth/auth-form';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { auth } from '../../../lib/firebase/client';
import { isSignInWithEmailLink, signInWithEmailLink, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { useToast } from '../../../hooks/use-toast';

function LoginContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processSignIn = async () => {
      // Handle Email Link Sign-In
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
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

      // Handle Google Redirect Result
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // This will trigger the onAuthStateChanged listener in AuthProvider
          // which will handle user profile creation/update and redirection.
          toast({
            title: `Welcome, ${result.user.displayName}!`,
            description: "You have successfully signed in.",
            variant: "success",
          });
        }
      } catch (error: any) {
        console.error('Google sign-in redirect error:', error);
        const credential = GoogleAuthProvider.credentialFromError(error);
        toast({
            title: "Sign-In Failed",
            description: error.message || "Could not complete sign-in. Please try again.",
            variant: "destructive"
        });
      }
      setIsProcessing(false);
    };

    processSignIn();

  }, [toast]);


  useEffect(() => {
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);


  if (authLoading || isProcessing || user) {
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
