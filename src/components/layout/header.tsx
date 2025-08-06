
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { LogIn, LogOut, UserCircle, Moon, Sun, Loader2, Gem } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
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
      await signOut(auth);
      router.push('/');
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
                  <Button asChild variant="ghost" className="h-9 rounded-md px-2 sm:px-3 text-primary hover:text-primary/80">
                    <Link href="/buy-coins">
                      <Gem className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="flex flex-col items-start -space-y-1 text-xs sm:text-sm">
                        <span className="hidden md:inline-flex font-semibold">Buy Coins</span>
                        <span className="font-semibold">{userProfile.coins.toLocaleString()}</span>
                      </div>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                  className="text-primary hover:text-primary/80"
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
                    <Button asChild variant="ghost" size="icon" aria-label="Profile">
                      <Link href="/profile">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profile</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign Out">
                      <LogOut className="h-5 w-5 text-primary" />
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
                  <Button asChild variant="ghost" size="icon" aria-label="Sign In">
                    <Link href="/login">
                      <LogIn className="h-5 w-5 text-primary" />
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
