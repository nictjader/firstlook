
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { Loader2, Mail, Chrome, MailCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/layout/logo';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Construct the URL for the email link. It should point back to the login page.
    const actionCodeSettings = {
      url: window.location.href,
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
      console.error(error);
      toast({
        title: "Error Sending Link",
        description: error.message || "Could not send sign-in link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    // No await here. The redirect will take over the page.
    // The result is handled on the login page itself when the user is redirected back.
    signInWithRedirect(auth, provider).catch((error: any) => {
        console.error("Google Sign-In Failed before redirect. Error:", error);
        toast({
            title: "Google Sign-In Failed",
            description: `Could not start the sign-in process. Error: ${error.message}`,
            variant: "destructive",
        });
        setLoading(false);
    });
  };


  const resetForm = () => {
    setEmail('');
    setLinkSentTo(null);
  };

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
            <Button variant="link" onClick={resetForm} disabled={loading}>Use a different email</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
                variant="outline" 
                className="w-full h-12 text-base"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Chrome className="mr-2 h-5 w-5" />}
                Continue with Google
            </Button>

            <div className="flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
            </div>

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
                variant="outline" 
                className="w-full h-12 text-base"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                Continue with Email
              </Button>
            </form>
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
