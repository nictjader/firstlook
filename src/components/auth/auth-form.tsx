
"use client";

import { useAuth } from '@/contexts/auth-context';
import { Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/layout/logo';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../hooks/use-toast';

export default function AuthForm() {
  const { user, loading, sendEmailSignInLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const { toast } = useToast();
  const googleButtonDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect ensures the Google button is rendered.
    // It's the standard way to handle rendering for the manual GIS flow.
    const renderGoogleButton = () => {
      if (window.google && window.google.accounts && googleButtonDiv.current) {
        window.google.accounts.id.renderButton(
          googleButtonDiv.current,
          {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: "320",
            callback: window.handleCredentialResponse
          }
        );
        // Enable one-tap login
        window.google.accounts.id.prompt();
      }
    };

    // The google script is loaded asynchronously, so we might need to wait for it.
    if (window.google) {
        renderGoogleButton();
    } else {
        // Fallback if the script isn't loaded yet.
        const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (script) {
            script.addEventListener('load', renderGoogleButton);
            return () => script.removeEventListener('load', renderGoogleButton);
        }
    }
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          toast({ title: 'Email Required', description: 'Please enter your email address.', variant: 'destructive' });
          return;
      }
      setIsEmailSending(true);
      try {
          await sendEmailSignInLink(email);
          toast({ variant: 'success', title: 'Check Your Email', description: 'A sign-in link has been sent to your email address.' });
          setEmail('');
      } catch (error: any) {
          toast({ title: 'Sign-In Failed', description: error.message, variant: 'destructive' });
      } finally {
          setIsEmailSending(false);
      }
  };

  if (loading || user) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Signing in...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4"><Logo /></div>
        <CardTitle>Welcome to FirstLook</CardTitle>
        <CardDescription>Fall in love with a story.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">

        {/* This div is the target for the Google button rendering */}
        <div ref={googleButtonDiv}></div>

        <div className="relative w-full max-w-xs flex items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <form onSubmit={handleEmailSignIn} className="w-full max-w-xs space-y-4">
            <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailSending}
                required
            />
            <Button type="submit" className="w-full" disabled={isEmailSending}>
                {isEmailSending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                    <><Mail className="mr-2 h-4 w-4" /> Send Sign-In Link</>
                )}
            </Button>
        </form>

      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
