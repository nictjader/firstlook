'use client';

import { Suspense, useEffect } from 'react';
import AuthForm from '../../../components/auth/auth-form';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../../../lib/firebase/client';
import { useToast } from '../../../hooks/use-toast';

function LoginContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles the email link sign-in completion
    const completeEmailSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href) && searchParams.get('finishSignUp')) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // User opened the link on a different device. To prevent session fixation
          // attacks, ask the user to provide the email again.
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
            try {
              await signInWithEmailLink(auth, email, window.location.href);
              window.localStorage.removeItem('emailForSignIn');
              toast({ variant: 'success', title: 'Sign In Successful', description: 'Welcome!' });
              // The onAuthStateChanged listener will handle the redirect
            } catch (error: any) {
              console.error("Email link sign-in error:", error);
              toast({ title: 'Sign-In Failed', description: error.message, variant: 'destructive'});
              router.replace('/login'); // Clear URL params
            }
        }
      }
    };
    completeEmailSignIn();
  }, [router, searchParams, toast]);

  useEffect(() => {
    // This effect handles redirecting the user after a successful sign-in
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
