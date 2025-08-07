
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { LogIn, LogOut, UserCircle, Moon, Sun, Loader2, Coins, MessageSquareHeart } from 'lucide-react';
import { useTheme } from 'next-themes';
import Logo from './logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Header() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // This is part of the Google One Tap implementation
      // It tells Google that the user has signed out of this website,
      // preventing the One Tap prompt from appearing automatically on the next visit.
      if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.disableAutoSelect();
      }

      await signOut(auth);
      // To ensure a clean sign-out and session clearance, we reload the page.
      // Next.js router might cache user state, a full reload prevents this.
      window.location.href = '/';
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Logo />

        <div className="flex items-center space-x-1 sm:space-x-2">
          <TooltipProvider>
            {user && userProfile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" className="h-9 rounded-md px-2 sm:px-3 text-primary font-semibold">
                    <Link href="/buy-coins">
                      <Coins className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span>{userProfile.coins.toLocaleString()}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buy More Coins</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
               <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" aria-label="Feedback" className="text-primary">
                    <Link href="/feedback">
                      <MessageSquareHeart className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
              <TooltipContent>
                <p>Give Feedback</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                  className="text-primary"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>

            {authLoading ? (
              <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-5 w-5 animate-spin" />
              </Button>
            ) : user ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" aria-label="Profile" className="text-primary">
                      <Link href="/profile">
                        <UserCircle className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profile</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign Out" className="text-primary">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" aria-label="Sign In" className="text-primary">
                    <Link href="/login">
                      <LogIn className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign In</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
