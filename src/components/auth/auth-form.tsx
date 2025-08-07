
"use client";

import { useState, useEffect } from 'react';
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
import { useEffectOnce } from '@/hooks/use-effect-once';
import { useAuth } from '@/contexts/auth-context';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.438 36.372 48 31 48 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


export default function AuthForm() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // This effect handles the email link sign-in process
  useEffectOnce(() => {
    const processEmailLink = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let storedEmail = window.localStorage.getItem('emailForSignIn');
            if (!storedEmail) {
                // If the email is not in local storage, we can't complete the sign-in.
                // This can happen if the user uses a different device or clears their storage.
                toast({
                    title: "Sign In Incomplete",
                    description: "Your sign-in link is valid, but we couldn't find your email. Please re-enter your email and try again.",
                    variant: "destructive",
                });
                return;
            }
            setLoading(true);
            try {
                await signInWithEmailLink(auth, storedEmail, window.location.href);
                window.localStorage.removeItem('emailForSignIn');
                toast({
                    variant: "success",
                    title: "Sign In Successful!",
                    description: "Welcome! You're now signed in."
                });
                // The AuthProvider will detect the signed-in state and redirect automatically.
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
  });
  
  // This effect handles redirecting logged-in users
  useEffect(() => {
    if (user && !authLoading) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);


  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // The redirect URL is now handled by the server-side auth handler after link verification
    const actionCodeSettings = {
      url: window.location.href, // The link will return the user to the same login page
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

  const loginUri = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google` : 'http://localhost:3000/api/auth/google';


  if (authLoading || user) {
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
                    Please wait while we complete your sign-in.
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
          <div className="space-y-4">
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
              <Button 
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Continue with Email
              </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
             <div id="g_id_onload"
                 data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                 data-login_uri={loginUri}
                 data-ux_mode="redirect"
                 data-auto_prompt="false">
            </div>
            <div className="g_id_signin"
                 data-type="standard"
                 data-shape="rectangular"
                 data-theme="outline"
                 data-text="continue_with"
                 data-size="large"
                 data-logo_alignment="left">
            </div>
          </div>
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
