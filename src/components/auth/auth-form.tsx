
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, Mail, MailCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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
      setLinkSentTo(email); // Set state to show confirmation
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

  const resetForm = () => {
    setEmail('');
    setLinkSentTo(null);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
      <div className="p-6 text-center">
        <div className="flex justify-center items-center mb-4">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-3xl font-headline font-semibold leading-none tracking-tight">Welcome to Siren</h3>
        <p className="text-sm text-muted-foreground">Stories that feel alive.</p>
      </div>
      <div className="p-6 pt-0 flex flex-col gap-4">
        {linkSentTo ? (
          <div className="space-y-4 text-center">
            <Alert variant="default" className="text-left">
                <MailCheck className="h-4 w-4" />
                <AlertTitle>Check Your Inbox!</AlertTitle>
                <AlertDescription>
                   A secure sign-in link has been sent to <span className="font-semibold text-primary">{linkSentTo}</span>.
                   Click the link in the email to sign in.
                </AlertDescription>
            </Alert>
            <Button variant="link" onClick={resetForm}>Use a different email</Button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
      <div className="flex items-center p-6 pt-0">
        <p className="text-xs text-center text-muted-foreground w-full">
          By continuing, you agree to Siren's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
