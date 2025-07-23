
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';
import { ChevronLeft, MailCheck, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const isPotentialMagicLink = searchParams.has('apiKey') && searchParams.has('oobCode');
  const [isVerifyingLink, setIsVerifyingLink] = useState(isPotentialMagicLink);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for the custom email prompt dialog
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const completeSignIn = (email: string | null) => {
    if (!email) {
      setErrorMessage("Email is required to complete the sign-in. Please try again.");
      setIsVerifyingLink(false);
      return;
    }

    const fullUrl = window.location.href;
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
  };

  const handlePromptSubmit = () => {
    const email = emailInputRef.current?.value || null;
    setShowEmailPrompt(false);
    completeSignIn(email);
  };

  useEffect(() => {
    if (isPotentialMagicLink) {
      const fullUrl = window.location.href;
      if (isSignInWithEmailLink(auth, fullUrl)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // Instead of window.prompt, show our custom dialog
          setShowEmailPrompt(true);
        } else {
          completeSignIn(email);
        }
      } else {
        setErrorMessage("The sign-in link is invalid or malformed. Please try again.");
        setIsVerifyingLink(false);
      }
    }
  }, [isPotentialMagicLink, router, toast]);


  if (isVerifyingLink && !showEmailPrompt) {
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
    <>
      <AlertDialog open={showEmailPrompt} onOpenChange={setShowEmailPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Email</AlertDialogTitle>
            <AlertDialogDescription>
              To complete your sign-in, please provide the email address where you received the link. This helps us keep your account secure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="email-confirm" className="sr-only">Email</Label>
            <Input ref={emailInputRef} id="email-confirm" type="email" placeholder="you@example.com" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => completeSignIn(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromptSubmit}>Confirm</Aler
tDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full max-w-md">
        <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-sm text-primary hover:underline">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <AuthForm />
      </div>
    </>
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
