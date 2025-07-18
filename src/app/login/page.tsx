
"use client";

import { useEffect, useState, Suspense } from 'react';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';
import { ChevronLeft, MailCheck, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const isPotentialMagicLink = searchParams.has('apiKey') && searchParams.has('oobCode');
  const [isVerifyingLink, setIsVerifyingLink] = useState(isPotentialMagicLink);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    if (isPotentialMagicLink) {
      const fullUrl = window.location.href;
      if (isSignInWithEmailLink(auth, fullUrl)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (email) {
          signInWithEmailLink(auth, email, fullUrl)
            .then(() => {
              window.localStorage.removeItem('emailForSignIn');
              toast({ title: "Success!", description: "You are now signed in." });
              router.push('/');
            })
            .catch((err) => {
              console.error(err);
              setErrorMessage("The sign-in link is invalid or has expired. Please try again.");
              setIsVerifyingLink(false);
            });
        } else {
          setErrorMessage("Email is required to complete the sign-in. Please try again.");
          setIsVerifyingLink(false);
        }
      } else {
        setErrorMessage("The sign-in link is invalid or malformed. Please try again.");
        setIsVerifyingLink(false);
      }
    }
  }, [isPotentialMagicLink, router, toast]);


  if (isVerifyingLink) {
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <MailCheck className="h-12 w-12 mx-auto text-primary" />
            <h2 className="mt-4 text-2xl font-semibold leading-none tracking-tight">Verifying Link...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we securely sign you in.
            </p>
        </div>
    );
  }

  if (errorMessage) {
      return (
           <div className="text-center">
                <h2 className="text-2xl font-semibold leading-none tracking-tight text-destructive">Sign-In Failed</h2>
                <div className="mt-2">
                    <p>{errorMessage}</p>
                    <Link href="/login" className="text-primary hover:underline mt-4 block">
                        Return to Login
                    </Link>
                </div>
           </div>
      );
  }


  return (
    <div className="w-full max-w-md">
      <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-sm text-primary hover:underline">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
      <AuthForm />
    </div>
  );
}

export default function LoginPage() {
  const loadingFallback = (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <Suspense fallback={loadingFallback}>
          <LoginContent />
        </Suspense>
      </main>
    </div>
  )
}
