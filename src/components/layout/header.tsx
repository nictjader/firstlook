
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Gem, LogIn, LogOut, UserCircle, Moon, Sun, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/theme-context';
import Logo from './logo';

export default function Header() {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Logo />

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/buy-coins" passHref>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 text-primary hover:text-primary/80">
                    <Gem className="h-4 w-4 mr-0 sm:mr-1" />
                    <span className="hidden sm:inline-flex">Coins</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Buy Coins</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                  className="text-primary hover:text-primary/80"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 transition-all" />
                  ) : (
                    <Moon className="h-5 w-5 transition-all" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Theme</p>
              </TooltipContent>
            </Tooltip>

            {authLoading ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled>
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Loading user...</p>
                </TooltipContent>
              </Tooltip>
            ) : user ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/profile" passHref>
                      <Button variant="ghost" size="icon" aria-label="Profile" className="text-primary hover:text-primary/80">
                        <UserCircle className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profile</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign Out" className="text-primary hover:text-primary/80">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/login" passHref>
                      <Button variant="ghost" size="icon" aria-label="Sign In" className="text-primary hover:text-primary/80">
                        <LogIn className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign In</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
