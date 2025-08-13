
  "use client";

  import { Suspense, useEffect, useState } from 'react';
  import AuthForm from '@/components/auth/auth-form';
  import Link from 'next/link';
  import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
  import Header from '@/components/layout/header';
  import { 
    isSignInWithEmailLink, 
    signInWithEmailLink 
  } from 'firebase/auth';
  import { auth } from '@/lib/firebase/client';
  import { useRouter, useSearchParams } from 'next/navigation';
  import { useToast } from '@/hooks/use-toast';
  import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
  import { Card, CardContent, CardHeader } from '@/components/ui/card';

  // This page must be dynamic because it handles authentication redirects and
  // relies on client-side state.
  export const dynamic = 'force-dynamic';

  function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isVerifying, setIsVerifying] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
      const processAuth = async () => {
        // Check for error parameter from redirects
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setAuthError(decodeURIComponent(errorParam));
          setIsVerifying(false);
          // Use router.replace to remove the error from the URL bar
          router.replace('/login', { scroll: false }); 
          return;
        }

        // Check for email link sign-in
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let email = window.localStorage.getItem('emailForSignIn');
          if (!email) {
            email = window.prompt('Please provide your email for confirmation');
          }
          if (email) {
            try {
              await signInWithEmailLink(auth, email, window.location.href);
              window.localStorage.removeItem('emailForSignIn');
              router.push('/profile');
            } catch (error: any) {
              console.error("Error signing in with email link:", error);
              setAuthError(error.message || "Failed to sign in with email link.");
            }
          } else {
            setAuthError("Email is required to complete sign-in.");
          }
        }
        
        // No longer need to handle Google redirect here, it's done in the component
        setIsVerifying(false);
      };

      processAuth();
    }, [router, searchParams, toast]);


    if (isVerifying) {
      return (
        <Card className="w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-2xl font-semibold tracking-tight">Verifying...</h3>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">
              Please wait while we complete the sign-in process.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="w-full max-w-md space-y-4">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Failed</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        <AuthForm />
      </div>
    );
  }

  export default function LoginPage() {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
          <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-md">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <Suspense>
            <LoginContent />
          </Suspense>
        </main>
      </div>
    );
  }