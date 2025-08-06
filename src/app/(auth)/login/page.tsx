
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
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
  
  const effectRan = useRef(false);

  // This effect runs once on mount to handle any incoming auth links or redirects
  useEffect(() => {
    if (effectRan.current || !auth) return;
    effectRan.current = true;

    // Check for Google redirect result first
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          // User successfully signed in with Google
          toast({
            variant: "success",
            title: "Sign In Successful!",
            description: "Welcome! You're now signed in with Google."
          });
          router.push(searchParams.get('redirect') || '/');
        } else {
          // No Google redirect, check for email link sign-in
          handleEmailLinkCheck();
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: `Google Sign-In Error: ${errorMessage}`,
        });
        setIsVerifying(false); // Stop loading on error
      });

    const handleEmailLinkCheck = () => {
        const fullUrl = window.location.href;
        if (isSignInWithEmailLink(auth, fullUrl)) {
          let email = window.localStorage.getItem('emailForSignIn');
          if (email) {
            signInWithEmailLink(auth, email, fullUrl)
              .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
                toast({
                  variant: "success",
                  title: "Sign In Successful!",
                  description: "Welcome! You're now signed in."
                });
                router.push(searchParams.get('redirect') || '/');
              })
              .catch((error) => {
                 let description = "An unknown error occurred. Please try again.";
                 if (error.code === 'auth/invalid-action-code') {
                   description = "This sign-in link may be expired or already used. Please request a new one.";
                 }
                 toast({
                   variant: "destructive",
                   title: "Sign In Failed",
                   description: description,
                 });
                 setIsVerifying(false);
              });
          } else {
            setShowEmailPrompt(true);
            setIsVerifying(false);
          }
        } else {
            // Not a Google redirect or an email link, so we're done with all checks
            setIsVerifying(false);
        }
    }
  }, [router, searchParams, toast]);

  // This effect handles displaying toasts for specific redirect reasons
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'favorite') {
      toast({
        title: "Sign in to Favorite",
        description: "You need an account to save your favorite stories.",
        variant: 'default',
      });
    }
  }, [searchParams, toast]);

  const handleEmailPromptSubmit = () => {
    const email = emailInputRef.current?.value;
    if (email) {
      setIsVerifying(true);
      setShowEmailPrompt(false);
      const fullUrl = window.location.href;
      signInWithEmailLink(auth, email, fullUrl)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
           toast({
              variant: "success",
              title: "Sign In Successful!",
              description: "Welcome! You're now signed in."
            });
          router.push(searchParams.get('redirect') || '/');
        })
        .catch(() => {
           toast({
             variant: "destructive",
             title: "Sign In Failed",
             description: "The email you provided does not match the one used for the link. Please try again.",
           });
           setIsVerifying(false);
        });
    } else {
        toast({
            variant: "destructive",
            title: "Email Required",
            description: "Please enter your email address to continue.",
        });
    }
  };

  const cancelEmailPrompt = () => {
    setShowEmailPrompt(false);
    setIsVerifying(false);
    toast({ variant: "destructive", title: "Sign-In Cancelled" });
  };


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
                    Please wait while we check your sign-in status.
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
            <AlertDialogAction onClick={handleEmailPromptSubmit}>Confirm & Sign In</AlertDialogAction>
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

    