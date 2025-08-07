
"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { getRedirectResult, onAuthStateChanged, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

// This component handles the result of the redirect and listens for auth state changes.
// It is placed in the root layout file to run on every page.
export default function AuthHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user, loading } = useAuth();
    
    // Use a ref to ensure redirect check only runs once per hard navigation.
    const hasCheckedRedirect = useRef(false);

    useEffect(() => {
        // This function will run once on initial load to check for a redirect result.
        const checkRedirect = async () => {
            if (hasCheckedRedirect.current) return;
            hasCheckedRedirect.current = true;

            try {
                // Check for Google redirect result first
                const result = await getRedirectResult(auth);
                if (result) {
                    toast({
                        variant: "success",
                        title: "Sign In Successful!",
                        description: `Welcome back, ${result.user.displayName || 'friend'}!`,
                    });
                    const redirectUrl = searchParams.get('redirect');
                    router.push(redirectUrl || '/');
                    return; // Exit early if we handled a redirect
                }

                // If no Google redirect, check for email link sign-in
                const fullUrl = window.location.href;
                if (isSignInWithEmailLink(auth, fullUrl)) {
                    let email = window.localStorage.getItem('emailForSignIn');
                    if (email) {
                        await signInWithEmailLink(auth, email, fullUrl);
                        window.localStorage.removeItem('emailForSignIn');
                        toast({
                            variant: "success",
                            title: "Sign In Successful!",
                            description: "Welcome! You're now signed in."
                        });
                        const redirectUrl = searchParams.get('redirect');
                        router.push(redirectUrl || '/');
                    } else {
                        // This case is handled by the email prompt on the login page,
                        // but it's good to have a fallback.
                        toast({
                            variant: 'destructive',
                            title: 'Email Required',
                            description: 'Please provide your email to complete sign-in.'
                        });
                        router.push('/login');
                    }
                }
            } catch (error: any) {
                console.error("Error during authentication check:", error);
                toast({
                    variant: "destructive",
                    title: "Sign In Failed",
                    description: error.message || "An error occurred during sign-in.",
                });
            }
        };

        checkRedirect();

    }, []); // Empty dependency array ensures this runs only on mount


    useEffect(() => {
        // This effect runs whenever the user's auth state or the current page changes.
        // It handles redirecting logged-in users away from the login page.
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && pathname === '/login') {
                const redirectUrl = searchParams.get('redirect');
                router.push(redirectUrl || '/');
            }
        });

        return () => unsubscribe();
    }, [pathname, router, searchParams]);


    useEffect(() => {
        // This effect shows a toast if the user was redirected to login
        // to favorite a story.
        const reason = searchParams.get('reason');
        if (reason === 'favorite' && pathname === '/login') {
            toast({
                title: "Sign in to Favorite",
                description: "You need an account to save your favorite stories.",
                variant: 'default',
            });
        }
    }, [pathname, searchParams, toast]);

    return null; // This component does not render anything.
}
