
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, Mail, MailCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/layout/logo';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.839 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);


export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = new URL(window.location.href);
    url.searchParams.set('email', email);
    
    const actionCodeSettings = {
      url: url.toString(),
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        toast({ variant: "success", title: "Success!", description: "You are now signed in." });
        router.push('/');
    } catch (error: any) {
        console.error(error);
        toast({
            title: "Sign-In Failed",
            description: error.message || "Could not sign in with Google. Please try again.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };


  const resetForm = () => {
    setEmail('');
    setLinkSentTo(null);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
      <div className="p-6 text-center">
        <div className="flex justify-center items-center mb-4">
          <Logo />
        </div>
        <h3 className="text-3xl font-headline font-semibold leading-none tracking-tight">Welcome to FirstLook</h3>
        <p className="text-sm text-muted-foreground">Unforgettable first encounters.</p>
      </div>
      <div className="p-6 pt-0 flex flex-col gap-4">
        {linkSentTo ? (
          <div className="space-y-4 text-center">
            <Alert variant="success">
                <MailCheck className="h-4 w-4" />
                <AlertTitle>Check Your Inbox!</AlertTitle>
                <AlertDescription>
                   A secure sign-in link has been sent to <span className="font-semibold">{linkSentTo}</span>.
                   Click the link in the email to sign in.
                </AlertDescription>
            </Alert>
            <Button variant="link" onClick={resetForm}>Use a different email</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
                variant="outline" 
                className="w-full h-12 text-base"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon />}
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
                variant="secondary" 
                className="w-full h-12 text-base"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                Continue with Email
              </Button>
            </form>
          </div>
        )}
      </div>
      <div className="flex items-center p-6 pt-0">
        <p className="text-xs text-center text-muted-foreground w-full">
          By continuing, you agree to FirstLook's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
