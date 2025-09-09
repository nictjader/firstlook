
"use client";
import { useEffect, useState, FormEvent, useRef } from 'react';
import Logo from '../layout/logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useAuth } from '../../contexts/auth-context';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function AuthForm() {
  const { user, loading: authLoading, isGsiScriptLoaded, sendSignInLinkToEmail, handleCredentialResponse } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const gsiButtonRef = useRef<HTMLDivElement>(null);
  const gsiInitialized = useRef(false);

  useEffect(() => {
    if (isGsiScriptLoaded && gsiButtonRef.current && !gsiInitialized.current) {
        if(window.google) {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
            if (clientId) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                });
                window.google.accounts.id.renderButton(
                    gsiButtonRef.current,
                    { 
                        theme: "outline", 
                        size: "large", 
                        type: 'standard', 
                        text: 'signin_with', 
                        width: '320',
                    }
                );
                gsiInitialized.current = true;
            }
        }
    }
  }, [isGsiScriptLoaded, handleCredentialResponse]);

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

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-primary">Welcome to FirstLook</CardTitle>
        <CardDescription>Fall in love with a story.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
        {!isGsiScriptLoaded ? (
          <Button disabled className="w-[320px] h-[40px]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Google Sign-In
          </Button>
        ) : (
          <div ref={gsiButtonRef}></div>
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
                        onChange={(e) => setEmail(e.target.value)}
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
  );
}
