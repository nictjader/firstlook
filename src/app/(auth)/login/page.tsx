
'use client';

import { Suspense, useEffect } from 'react';
import AuthForm from '../../../components/auth/auth-form';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { auth } from '../../../lib/firebase/client';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useToast } from '../../../hooks/use-toast';


function LoginContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles the completion of the email link sign-in
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // If the email is not in local storage, it means the user is on a different device.
          // We need to prompt them for their email.
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
    }
    
    completeSignIn();

    // This effect handles redirecting an already logged-in user
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, searchParams, toast]);

  if (authLoading || user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthForm />;
}


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
