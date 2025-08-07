
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

// This component handles global authentication side-effects, like redirecting
// logged-in users away from the login page. The actual sign-in logic
// is now handled on the login page itself.
export default function AuthHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        // Don't do anything until the auth state is fully loaded
        if (loading) return;

        // This effect redirects a logged-in user away from the login page.
        if (user && pathname === '/login') {
            const redirectUrl = searchParams.get('redirect');
            router.push(redirectUrl || '/');
        }

        // This effect shows a toast if the user was redirected to login
        // for a specific reason, like trying to favorite a story.
        const reason = searchParams.get('reason');
        if (reason === 'favorite' && pathname === '/login') {
            toast({
                title: "Sign in to Favorite",
                description: "You need an account to save your favorite stories.",
                variant: 'default',
            });
             // Clean the URL
            router.replace('/login', { scroll: false });
        }
    }, [user, loading, pathname, router, searchParams, toast]);

    return null; // This component does not render anything.
}
