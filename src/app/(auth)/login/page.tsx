
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

  const [isHandlingEmailLink, setIsHandlingEmailLink] = useState(true);

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
            toast({
              title: "Signed In Successfully!",
              description: `Welcome back!`,
              variant: "success",
            });
          })
          .catch((error) => {
            console.error("Error signing in with email link:", error);
            toast({
              title: "Sign-In Failed",
              description: error.message || "The sign-in link is invalid or has expired.",
              variant: "destructive"
            });
            setIsHandlingEmailLink(false);
          });
      } else {
        toast({ title: "Email Required", description: "Your email is needed to complete the sign-in.", variant: "destructive" });
        setIsHandlingEmailLink(false);
      }
    } else {
      setIsHandlingEmailLink(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  if (authLoading || isHandlingEmailLink || user) {
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
