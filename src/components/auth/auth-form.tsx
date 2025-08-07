
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { Loader2, Mail, MailCheck } from 'lucide-react';
import Logo from '@/components/layout/logo';
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function AuthForm() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gsiInitialized = useRef(false);

  // This effect handles the email link sign-in process, if a user returns to the page with a link
  useEffect(() => {
    const processEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let storedEmail = window.localStorage.getItem('emailForSignIn');
        if (!storedEmail) {
          // If the email is not in local storage, we can't complete the sign-in.
          // This can happen if the user opens the link on a different browser.
          // For now, we'll show a toast. A more advanced implementation might prompt the user for their email again.
          toast({
            title: "Sign In Incomplete",
            description: "Your sign-in link is valid, but we couldn't find your email. Please re-enter your email to sign in.",
            variant: "destructive",
          });
          return;
        }
        setLoading(true);
        try {
          // The sign-in is completed here. onAuthStateChanged in AuthContext will handle the redirect.
          await signInWithEmailLink(auth, storedEmail, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          toast({
            variant: "success",
            title: "Sign In Successful!",
            description: "Welcome! You're now signed in."
          });
        } catch (error) {
          toast({
            title: "Sign In Failed",
            description: "The sign-in link is invalid or has expired. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    processEmailLink();
  }, [toast]); // Run this once on mount

  // Effect to redirect the user if they are already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const redirectUrl = searchParams.get('redirect') || '/profile';
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  // Effect to initialize Google Sign-In and One Tap
  useEffect(() => {
    if (gsiInitialized.current) {
      return;
    }
    if (typeof window.google === 'undefined' || !window.google.accounts) {
      return;
    }
    gsiInitialized.current = true;

    try {
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        throw new Error("Google Client ID is not configured.");
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        login_uri: `${window.location.origin}/api/auth/google`,
        auto_select: true,
        ux_mode: 'redirect',
      });

      const googleButtonParent = document.getElementById('g_id_signin');
      if (googleButtonParent) {
        window.google.accounts.id.renderButton(
          googleButtonParent,
          { theme: "outline", size: "large", text: "continue_with", shape: "rectangular", logo_alignment: "left" }
        );
      }
      
      if (!user) {
        window.google.accounts.id.prompt();
      }

    } catch (error: any) {
      console.error("Error initializing Google Sign-In:", error);
      toast({
        title: "Could not load Google Sign-In",
        description: "Please try refreshing the page or contact support if the issue persists.",
        variant: "destructive"
      });
    }
  }, [user, authLoading, toast]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast({
        variant: "success",
        title: "Check Your Inbox!",
        description: `A secure sign-in link was sent to ${email}.`,
      });
      setLinkSentTo(email);
    } catch (error: any) {
      toast({
        title: "Error Sending Link",
        description: error.message || "Could not send sign-in link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Display a loading state while checking auth or if user is already logged in and redirecting
  if (authLoading || (user && !authLoading)) {
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
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
          <Logo />
        </div>
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-primary">Welcome to FirstLook</h3>
        <p className="text-sm text-muted-foreground">Fall in love with a story.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Google Sign-In Button Container */}
        <div id="g_id_signin" className="w-full flex justify-center"></div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>

        {linkSentTo ? (
          <div className="space-y-4 text-center">
             <div className="text-center space-y-2">
                <MailCheck className="h-8 w-8 text-green-500 mx-auto" />
                <p className="text-muted-foreground">
                   A sign-in link has been sent to <span className="font-semibold text-primary">{linkSentTo}</span>.
                   Click the link in the email to complete your sign-in.
                </p>
            </div>
            <Button variant="link" onClick={() => setLinkSentTo(null)} disabled={loading}>Use a different email</Button>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Continue with Email
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          By continuing, you agree to FirstLook's Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
