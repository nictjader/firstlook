'use client';

import { Suspense, useEffect } from 'react';
import AuthForm from '../../../components/auth/auth-form';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { auth } from '../../../lib/firebase/client';
import { isSignInWithEmailLink, signInWithEmailLink, signInWithCustomToken } from 'firebase/auth';
import { useToast } from '../../../hooks/use-toast';

function LoginContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const completeEmailSignIn = async () => {
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
    };

    const completeGoogleSignIn = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Sign-In Failed",
          description: decodeURIComponent(error),
          variant: "destructive"
        });
        router.replace('/login', { scroll: false });
      } else if (token) {
        try {
          await signInWithCustomToken(auth, token);
          // The main useEffect will handle the redirect to '/'
        } catch (e) {
          console.error("Failed to sign in with custom token", e);
          toast({
            title: "Sign-In Failed",
            description: "There was a problem signing you in. Please try again.",
            variant: "destructive"
          });
          // Clear the token from the URL to prevent retry loops
          router.replace('/login', { scroll: false });
        }
      }
    };
    
    completeEmailSignIn();
    completeGoogleSignIn();

  }, [toast, router, searchParams]);

  useEffect(() => {
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
