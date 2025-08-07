"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { Loader2, Mail, MailCheck } from 'lucide-react';
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

  useEffect(() => {
    // This effect handles redirecting the user if they are already logged in.
    if (user && !authLoading) {
      const redirectUrl = searchParams.get('redirect') || '/profile';
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    // This effect initializes Google Sign-In. It waits until the auth state is
    // resolved and checks for a Client ID before proceeding.
    if (authLoading || !googleClientId || user) {
      return; // Wait for auth state, or if user is logged in, or if no client ID.
    }

    // Prevent re-initialization on re-renders.
    if (gsiInitialized.current) {
        return;
    }

    if (typeof window.google === 'undefined' || !window.google.accounts) {
        console.error("Google GSI script not loaded. Make sure it's included in the main layout.");
        return;
    }
    
    gsiInitialized.current = true;

    try {
        // Initialize the Google Sign-In client.
        window.google.accounts.id.initialize({
            client_id: googleClientId,
            login_uri: `${window.location.origin}/api/auth/google`,
            auto_select: true, // Enables One Tap automatic sign-in
            ux_mode: 'redirect',
        });

        const googleButtonParent = document.getElementById('g_id_signin');
        if (googleButtonParent) {
            // Render the Google Sign-In button.
            window.google.accounts.id.renderButton(
                googleButtonParent,
                { theme: "outline", size: "large", text: "continue_with", shape: "rectangular", logo_alignment: "left" }
            );
        }

        // Prompt the user with the One Tap UI for automatic sign-in.
        window.google.accounts.id.prompt();

    } catch (error: any) {
        console.error("Error initializing Google Sign-In:", error);
        toast({
            title: "Could not load Google Sign-In",
            description: "There was an issue initializing the sign-in service.",
            variant: "destructive"
        });
    }
  }, [user, authLoading, toast, googleClientId]);

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
        description: error.message || "Could not send sign-in link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        {googleClientId ? (
          <>
            <div id="g_id_signin" className="w-full flex justify-center min-h-[40px]"></div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-center text-muted-foreground">Enter your email to sign in or create an account.</p>
        )}
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
