
"use client";
import { useState, FormEvent, useEffect } from 'react';
import Logo from '../layout/logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useAuth } from '../../contexts/auth-context';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Script from 'next/script';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const { user, loading: authLoading, sendSignInLinkToEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleGoogleCredentialResponse = async (response: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to authenticate with backend.');
      }
      
      const { token } = await res.json();
      await signInWithCustomToken(auth, token);
      
      // Redirect on successful sign-in
      router.push('/');

    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      toast({
        title: 'Sign-In Failed',
        description: error.message || 'There was a problem signing you in with Google.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Make the callback function global so the GSI library can call it
    (window as any).handleGoogleCredentialResponse = handleGoogleCredentialResponse;

    // Cleanup function to remove the global function when the component unmounts
    return () => {
      delete (window as any).handleGoogleCredentialResponse;
    };
  }, []); // Empty dependency array ensures this runs only once


  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailSent(false);

    try {
      await sendSignInLinkToEmail(email);
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send sign-in link", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || (user && !authLoading)) {
     return null; // The parent page will handle the loading spinner
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async defer />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-primary">Welcome to FirstLook</CardTitle>
          <CardDescription>Fall in love with a story.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          
          {googleClientId && (
            <>
              <div id="g_id_onload"
                   data-client_id={googleClientId}
                   data-callback="handleGoogleCredentialResponse"
                   data-ux_mode="popup"
                   data-auto_prompt="false">
              </div>
              <div className="g_id_signin"
                   data-type="standard"
                   data-size="large"
                   data-theme="outline"
                   data-text="signin_with"
                   data-shape="rectangular"
                   data-logo_alignment="left"
                   data-width="320">
              </div>
            </>
          )}

          <div className="relative w-full max-w-[320px]">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                  OR
                  </span>
              </div>
          </div>

          {emailSent ? (
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg max-w-[320px]">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Check your email!</p>
                  <p className="text-xs text-muted-foreground mt-1">A sign-in link has been sent to <strong>{email}</strong>.</p>
              </div>
          ) : (
               <form onSubmit={handleEmailSignIn} className="w-full max-w-[320px] space-y-4">
                  <div className="space-y-1">
                      <Label htmlFor="email" className="sr-only">Email address</Label>
                      <Input 
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.targ-et.value)}
                          required
                          disabled={isSubmitting}
                      />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !email}>
                      {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <Mail className="mr-2 h-4 w-4" />
                      )}
                      Send Sign-In Link
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
    </>
  );
}
