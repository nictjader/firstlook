
"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { Loader2, Mail, MailCheck, AlertTriangle } from 'lucide-react';
import Logo from '@/components/layout/logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // New handler for Google Sign-In callback
  const handleGoogleSignIn = async (response: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-and-sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response,
          clientRedirectUri: window.location.origin
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Server-side session was created, redirect to the profile page
        router.push(data.redirectUrl || '/profile');
      } else {
        throw new Error(data.error || 'Failed to sign in.');
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user && !authLoading) {
      const redirectUrl = searchParams.get('redirect') || '/profile';
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (gsiInitialized.current || !googleClientId || authLoading || user) {
      return;
    }
    if (typeof window.google === 'undefined' || !window.google.accounts) {
      console.error("Google GSI script not loaded.");
      return;
    }
    gsiInitialized.current = true;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleSignIn, // Use the same callback for button and One Tap
    });

    const googleButtonParent = document.getElementById('google-button-parent');
    if (googleButtonParent) {
      window.google.accounts.id.renderButton(
        googleButtonParent,
        { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', logo_alignment: 'left' }
      );
    }
    
    // This is the command that triggers the One Tap prompt.
    window.google.accounts.id.prompt(); 

  }, [googleClientId, authLoading, user]);

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
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
        description: error.message || "Could not send sign-in link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && !authLoading) || loading) {
     return (
        <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight flex items-center justify-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  {loading ? 'Signing in...' : 'Verifying...'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Please wait while we complete the sign-in process.
                </p>
            </CardContent>
        </Card>
    );
  }

  if (!googleClientId) {
    return (
        <Card className="w-full max-w-md text-center shadow-2xl bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center justify-center">
                  <AlertTriangle className="mr-2 h-6 w-6" />
                  Configuration Error
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-destructive-foreground">
                    The Google Client ID is missing. Please add the 
                    <code className="bg-destructive/20 text-destructive-foreground font-mono p-1 rounded-sm mx-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
                    variable to your environment.
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
        <div id="google-button-parent" className="w-full flex justify-center min-h-[40px]"></div>
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

    