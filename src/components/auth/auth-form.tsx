"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/client';
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { sendSignInLinkToEmail } from 'firebase/auth';
import { Loader2, Mail, MailCheck, AlertTriangle } from 'lucide-react';
import Logo from '@/components/layout/logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';

export default function AuthForm() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Before redirecting, save the current client origin.
      // This will be retrieved on the login page after the redirect.
      sessionStorage.setItem('clientRedirectUri', window.location.origin);
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Error", error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const actionCodeSettings = {
      url: `${window.location.origin}/login?email=${encodeURIComponent(email)}`, // Pass email for post-redirect retrieval
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
  
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
        <Button onClick={handleGoogleSignIn} disabled={loading} variant="outline" className="h-11">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.2 0 128.5 110.3 18.2 244 18.2c71.2 0 131.2 29.2 176.4 72.8l-63.4 61.9C333.3 128.4 291.5 103.5 244 103.5c-74.8 0-135.2 61.2-135.2 137.2 0 75.8 60.4 137 135.2 137 83.8 0 119.2-64.2 122.7-96.5H244v-73.4h239.5c4.7 26.5 7.5 56.1 7.5 88.1z"></path>
                </svg>
            }
          Continue with Google
        </Button>
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
