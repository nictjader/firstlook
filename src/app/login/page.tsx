
"use client";

import { useEffect, useState, Suspense } from 'react';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';
import { ChevronLeft, MailCheck, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // A magic link URL will contain these query parameters.
  // This check is a client-side optimization to prevent flashing the "Verifying..."
  // screen on every page load.
  const isPotentialMagicLink = searchParams.has('apiKey') && searchParams.has('oobCode');

  // Only show the "Verifying..." screen if the URL looks like a magic link.
  const [isVerifyingLink, setIsVerifyingLink] = useState(isPotentialMagicLink);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    // Only run the Firebase check if the URL contains magic link parameters.
    if (isPotentialMagicLink) {
      const fullUrl = window.location.href;
      if (isSignInWithEmailLink(auth, fullUrl)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // User opened the link on a different device. To prevent session fixation
          // attacks, ask the user to provide the email again.
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
          // This case handles when the user cancels the email prompt.
          setErrorMessage("Email is required to complete the sign-in. Please try again.");
          setIsVerifyingLink(false);
        }
      } else {
        // This case handles when the URL has the params but Firebase says it's not a valid link.
        setErrorMessage("The sign-in link is invalid or malformed. Please try again.");
        setIsVerifyingLink(false);
      }
    }
  }, [isPotentialMagicLink, router, toast]);


  if (isVerifyingLink) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <MailCheck className="h-12 w-12 mx-auto text-primary" />
                    <CardTitle className="text-2xl">Verifying Link...</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        Please wait while we securely sign you in.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (errorMessage) {
      return (
           <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
              <Card className="w-full max-w-md text-center">
                  <CardHeader>
                      <CardTitle className="text-2xl text-destructive">Sign-In Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p>{errorMessage}</p>
                      <Link href="/login" className="text-primary hover:underline mt-4 block">
                          Return to Login
                      </Link>
                  </CardContent>
              </Card>
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

// Next.js's `useSearchParams` hook should be used within a `<Suspense>` boundary.
// We'll wrap the main content in a component and then wrap that component in Suspense.
export default function LoginPage() {
  const loadingFallback = (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <Suspense fallback={loadingFallback}>
      <LoginContent />
    </Suspense>
  )
}
