"use client";
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/layout/logo';
import { FormEvent, useState } from 'react';
import { Mail } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';

export default function AuthForm() {
  const { user, loading, sendSignInLinkToEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  
  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setEmailSent(false);

    try {
      await sendSignInLinkToEmail(email);
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send sign-in link", error);
      toast({
        title: "Error",
        description: "Could not send sign-in link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
     return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Verifying...
                </CardTitle>
            </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">Please wait while we sign you in.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-primary">Welcome to FirstLook</CardTitle>
        <CardDescription>Fall in love with a story.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div
          id="g_id_onload"
          data-client_id={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}
          data-context="signin"
          data-ux_mode="redirect"
          data-login_uri="/api/auth/google/callback"
          data-auto_prompt="false"
        ></div>
        <div
          className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
          data-width="320"
        ></div>
       
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
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
