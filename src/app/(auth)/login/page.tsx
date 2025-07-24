
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';
import { ChevronLeft, MailCheck, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const isPotentialMagicLink = searchParams.has('apiKey') && searchParams.has('oobCode');
  const [isVerifyingLink, setIsVerifyingLink] = useState(isPotentialMagicLink);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);


  // State for the custom email prompt dialog
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'favorite') {
      setInfoMessage("You need to create an account to favorite stories.");
    }
  }, [searchParams]);

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
        toast({ 
          variant: "success",
          title: "Success!", 
          description: "You are now signed in." 
        });
        router.push('/');
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("The sign-in link is invalid, has expired, or was already used. Please request a new link.");
        setIsVerifyingLink(false);
      });
  };

  const handlePromptSubmit = () => {
    const email = emailInputRef.current?.value || null;
    setShowEmailPrompt(false);
    setIsVerifyingLink(true);
    completeSignIn(email);
  };

  useEffect(() => {
    if (isPotentialMagicLink && isVerifyingLink) { // Only run this once
      const fullUrl = window.location.href;
      if (isSignInWithEmailLink(auth, fullUrl)) {
        let email = searchParams.get('email');
        if (!email) {
            email = window.localStorage.getItem('emailForSignIn');
        }
        
        if (!email) {
          setIsVerifyingLink(false);
          setShowEmailPrompt(true);
        } else {
          completeSignIn(email);
        }
      } else {
        setErrorMessage("The sign-in link is invalid or malformed. Please try again.");
        setIsVerifyingLink(false);
      }
    }
  }, [isPotentialMagicLink, router, toast, searchParams, isVerifyingLink]);


  if (isVerifyingLink && !showEmailPrompt) {
    return (
        <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-primary font-semibold tracking-tight flex items-center justify-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Verifying Link...
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Please wait while we securely sign you in. This may take a moment.
                </p>
            </CardContent>
        </Card>
    );
  }

  if (errorMessage) {
      return (
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Sign-In Failed</AlertTitle>
            <AlertDescription>
              {errorMessage}
               <Link href="/login" className="text-destructive-foreground hover:underline font-semibold mt-2 block">
                Return to Login &rarr;
              </Link>
            </AlertDescription>
          </Alert>
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
            <AlertDialogCancel onClick={() => {
              setShowEmailPrompt(false);
              setErrorMessage("Sign-in cancelled.");
              setIsVerifyingLink(false);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromptSubmit}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full max-w-md space-y-4">
         {infoMessage && (
          <Alert>
            <AlertTitle>Please Sign In</AlertTitle>
            <AlertDescription>{infoMessage}</AlertDescription>
          </Alert>
        )}
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
