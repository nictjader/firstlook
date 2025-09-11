"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/layout/logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

export default function AuthForm() {
  const { user, loading, sendSignInLinkToEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs when the component mounts.
    // It initializes the Google Sign-In client and renders the button for REDIRECT mode.
    if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
            login_uri: "/api/auth/google/callback",
            ux_mode: "redirect"
        });
        
        const buttonDiv = document.getElementById("g_id_signin_div");
        if (buttonDiv) {
            window.google.accounts.id.renderButton(
                buttonDiv,
                { theme: "outline", size: "large", type: "standard", shape: "rectangular", text: "signin_with", logo_alignment: "left", width: "320" }
            );
        }
    }
  }, []);


  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({
            title: "Email Required",
            description: "Please enter your email address.",
            variant: "destructive"
        });
        return;
    }
    setIsSubmitting(true);
    try {
        await sendSignInLinkToEmail(email);
        setEmailSent(true);
    } catch (error: any) {
        console.error("Failed to send sign-in link", error);
        toast({
            title: "Sign-In Failed",
            description: error.message || "Could not send sign-in link. Please try again.",
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
      </Card>
    );
  }
  
  if (emailSent) {
    return (
       <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4"><Mail className="h-12 w-12 text-primary" /></div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
                A sign-in link has been sent to <strong>{email}</strong>. Please check your inbox and follow the link to complete your sign-in.
            </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4"><Logo /></div>
        <CardTitle>Welcome to FirstLook</CardTitle>
        <CardDescription>Fall in love with a story.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-8 pb-2 space-y-6">
        {/* Container for the Google Sign-In button */}
        <div id="g_id_signin_div"></div>
        
        <div className="relative w-full max-w-[320px]">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
        </div>

        <form onSubmit={handleEmailSignIn} className="w-full max-w-[320px] space-y-3">
            <Input 
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-10"
            />
            <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Mail className="mr-2 h-4 w-4" />
                )}
                Send Sign-In Link
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
