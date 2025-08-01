
"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSuccessfulSignIn = useCallback(() => {
    toast({
      variant: "success",
      title: "Sign In Successful!",
      description: "Welcome! You are now signed in."
    });
    const redirectUrl = searchParams.get('redirect');
    const packageId = searchParams.get('packageId');

    if (redirectUrl) {
      const finalUrl = packageId ? `${redirectUrl}?packageId=${packageId}` : redirectUrl;
      router.push(finalUrl);
    } else {
      router.push('/');
    }
  }, [router, searchParams, toast]);

  const completeEmailSignIn = useCallback((email: string) => {
    const fullUrl = window.location.href;
    signInWithEmailLink(auth, email, fullUrl)
      .then(() => {
        window.localStorage.removeItem('emailForSignIn');
        handleSuccessfulSignIn();
      })
      .catch((err) => {
        console.error(err);
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: "This sign-in link may be expired or already used. Please request a new one.",
        });
        setIsVerifying(false);
      });
  }, [handleSuccessfulSignIn, toast]);

  const handlePromptSubmit = () => {
    const email = emailInputRef.current?.value;
    setShowEmailPrompt(false);
    if (email) {
        setIsVerifying(true);
        completeEmailSignIn(email);
    } else {
        toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: "An email address is required. Please try again.",
        });
    }
  };
  
  const cancelEmailPrompt = () => {
    setShowEmailPrompt(false);
    toast({ variant: "destructive", title: "Sign-In Cancelled" });
    setIsVerifying(false);
  }

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'favorite') {
      toast({
        title: "Sign in to Favorite",
        description: "You need an account to save your favorite stories.",
        variant: 'default',
      });
    } else if (reason === 'purchase') {
      toast({
        title: "Sign in to Purchase",
        description: "You need an account to purchase coins and unlock stories.",
        variant: 'default',
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          // This means the user has successfully signed in via Google redirect.
          handleSuccessfulSignIn();
        } else {
          // No Google redirect result, check for email link.
          const fullUrl = window.location.href;
          if (isSignInWithEmailLink(auth, fullUrl)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (email) {
              completeEmailSignIn(email);
            } else {
              // User has the link but we don't have their email. Prompt them.
              setIsVerifying(false);
              setShowEmailPrompt(true);
            }
          } else {
            // This is a normal page load, not a redirect or link click.
            setIsVerifying(false);
          }
        }
      })
      .catch((err) => {
        console.error("Error during authentication check:", err);
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: "An error occurred during sign-in. Please try again.",
        });
        setIsVerifying(false);
      });
  // These dependencies are correct. This effect should only run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isVerifying) {
    return (
        <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight flex items-center justify-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Verifying...
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

  return (
    <>
      <AlertDialog open={showEmailPrompt} onOpenChange={setShowEmailPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Email</AlertDialogTitle>
            <AlertDialogDescription>
              To complete sign-in, please provide the email where you received the link. This keeps your account secure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="email-confirm" className="sr-only">Email</Label>
            <Input ref={emailInputRef} id="email-confirm" type="email" placeholder="you@example.com" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelEmailPrompt}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromptSubmit}>Confirm & Sign In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full max-w-md space-y-4">
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
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
        <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-md">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <Suspense fallback={loadingFallback}>
          <LoginContent />
        </Suspense>
      </main>
    </div>
  )
}

    