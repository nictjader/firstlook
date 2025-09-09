
"use client";
import { useEffect, useState, FormEvent } from 'react';
import Logo from '../layout/logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { Loader2, Mail } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';

export default function AuthForm() {
  const { user, loading: authLoading, isMobile, sendSignInLinkToEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      const redirectUrl = searchParams.get('redirect') || '/profile';
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (window.google) {
      const uxMode = isMobile ? 'redirect' : 'popup';
      
      window.google.accounts.id.renderButton(
        document.getElementById("gsi-button")!,
        { 
            theme: "outline", 
            size: "large", 
            type: 'standard', 
            text: 'signin_with', 
            width: '320',
            ux_mode: uxMode 
        }
      );
    }
  }, [isMobile]);

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendSignInLinkToEmail(email);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to send sign-in link", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send sign-in link. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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
                    Please wait while we check your login status.
                </p>
            </CardContent>
        </Card>
    );
  }

  if (submitted) {
    return (
       <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight flex items-center justify-center">
                  <Mail className="mr-2 h-6 w-6 text-primary" />
                  Check Your Email
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    A secure sign-in link has been sent to <strong>{email}</strong>. Click the link to log in.
                </p>
            </CardContent>
        </Card>
    )
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
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div id="gsi-button"></div>
        
        <div className="flex items-center w-full max-w-xs">
            <Separator className="flex-grow" />
            <span className="mx-4 text-xs text-muted-foreground">OR</span>
            <Separator className="flex-grow" />
        </div>

        <form onSubmit={handleEmailSignIn} className="w-full max-w-xs space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Sending...' : 'Continue with Email'}
          </Button>
        </form>

      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          By continuing, you agree to FirstLook's Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
