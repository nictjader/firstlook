"use client";
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/layout/logo';
import { useEffect } from 'react';

export default function AuthForm() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // This effect ensures the Google Sign-In button is rendered correctly for the redirect flow.
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        ux_mode: "redirect",
        login_uri: "/api/auth/google/callback"
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

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4"><Logo /></div>
        <CardTitle>Welcome to FirstLook</CardTitle>
        <CardDescription>Fall in love with a story.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        {/* This div is now the target for the renderButton function */}
        <div id="g_id_signin_div"></div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
