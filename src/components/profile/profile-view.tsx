
"use client";

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Gem, Mail, UserCircle, LogOut, History, Heart, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut, verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import StoryListCard from './story-list-card';
import TransactionHistoryCard from './transaction-history-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { type Story, type CoinTransaction } from '@/lib/types';
import { getStoriesByIds } from '@/lib/actions/storyActions.client';
import { getCoinPurchaseHistory } from '@/lib/actions/paymentActions';
import { Skeleton } from '../ui/skeleton';
import { useEffectOnce } from '@/hooks/use-effect-once';
import { resyncUserBalanceAction } from '@/lib/actions/adminActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProfileView() {
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [storiesMap, setStoriesMap] = useState<Map<string, Story>>(new Map());
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isResyncing, setIsResyncing] = useState(false);

  // This effect runs once on mount to check for a successful purchase redirect.
  useEffectOnce(() => {
    if (searchParams.get('purchase_success')) {
        toast({
            variant: 'success',
            title: 'Purchase Successful!',
            description: 'Your new coin balance may take a moment to update. Click "Resync Balance" if it doesn\'t appear.',
        });
        refreshUserProfile();
        // Clean the URL to avoid showing the toast on every refresh
        router.replace('/profile', { scroll: false });
    }
  });


  useEffect(() => {
    const fetchAllHistory = async () => {
      if (!user || !userProfile) return;

      setIsLoadingHistory(true);
      
      const favoriteIds = userProfile.favoriteStories || [];
      const readIds = userProfile.readStories || [];
      const unlockedIds = (userProfile.unlockedStories || []).map(s => s.storyId);
      const allUniqueStoryIds = [...new Set([...favoriteIds, ...readIds, ...unlockedIds])];

      try {
        // Fetch story details and coin purchase history in parallel
        const [fetchedStories, fetchedTransactions] = await Promise.all([
          allUniqueStoryIds.length > 0 ? getStoriesByIds(allUniqueStoryIds) : Promise.resolve([]),
          getCoinPurchaseHistory(user.uid)
        ]);

        const newStoriesMap = new Map(fetchedStories.map(s => [s.storyId, s]));
        setStoriesMap(newStoriesMap);
        setCoinTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Failed to fetch user history:", error);
        toast({
            variant: "destructive",
            title: "Error fetching history",
            description: "Could not load all your stories and transactions. Please try refreshing."
        });
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    if (!authLoading && user && userProfile) {
      fetchAllHistory();
    }
  }, [user, userProfile, authLoading, refreshUserProfile, toast]);


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      router.push('/');
    } catch (error) {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    }
  };
  
  const handleResyncBalance = async () => {
    if (!user) return;
    setIsResyncing(true);
    try {
      const result = await resyncUserBalanceAction(user.uid);
      if (result.success && result.finalBalance !== undefined) {
        toast({
          variant: 'success',
          title: 'Balance Synced!',
          description: `Your coin balance has been updated to ${result.finalBalance.toLocaleString()}.`,
        });
        await refreshUserProfile();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: error.message || 'An unknown error occurred while syncing your balance.',
      });
    } finally {
      setIsResyncing(false);
    }
  };


  const handleEmailChange = async () => {
    if (!user || !newEmail || newEmail === user.email) {
      toast({ title: "Invalid Email", description: "Please enter a new, valid email address.", variant: "destructive" });
      return;
    }
    setIsUpdatingEmail(true);
    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      toast({
        title: "Verification Email Sent",
        description: `A link to verify your new email address has been sent to ${newEmail}.`,
        variant: 'success',
        duration: 8000,
      });
      setIsEmailDialogOpen(false);
      setNewEmail('');
    } catch (error: any) {
       let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This email address is already in use by another account.";
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = "This is a sensitive operation. Please sign out and sign back in before changing your email.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "The email address you entered is not valid.";
        }
      toast({
        title: "Email Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };


  if (authLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (!user || !userProfile) {
    router.push('/login');
    return <p>Redirecting to login...</p>;
  }

  const favoriteStories = (userProfile.favoriteStories || []).map(id => storiesMap.get(id)).filter((s): s is Story => !!s);
  const readStories = (userProfile.readStories || []).slice().reverse().map(id => storiesMap.get(id)).filter((s): s is Story => !!s);

  return (
    <div className="space-y-8">
       <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 p-6">
          <div className="flex items-center space-x-4">
            <UserCircle className="h-16 w-16 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">
                {userProfile.displayName || userProfile.email || 'FirstLook User'}
              </CardTitle>
              <CardDescription>Manage your account details.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center text-sm font-semibold"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/>Email Address</Label>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground bg-muted/50 px-3 py-2 rounded-md w-full">{userProfile.email || 'No email provided'}</p>
               <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-4 flex-shrink-0">Change</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Email Address</DialogTitle>
                    <DialogDescription>
                      We'll send a verification link to your new email. Your address won't be updated until you click the link.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-email" className="text-right">
                        New Email
                      </Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="col-span-3"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary" disabled={isUpdatingEmail}>
                        Cancel
                      </Button>
                    </DialogClose>
                     <Button type="submit" onClick={handleEmailChange} disabled={isUpdatingEmail}>
                      {isUpdatingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Send Verification
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center text-sm font-semibold"><Gem className="w-4 h-4 mr-2 text-yellow-500"/>Coin Balance</Label>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-2xl font-bold text-primary">{userProfile.coins.toLocaleString()} Coins</span>
               <Button asChild variant="secondary">
                  <Link href="/buy-coins">
                    Buy More Coins
                  </Link>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <StoryListCard 
        title="Favorite Stories" 
        stories={favoriteStories}
        isLoading={isLoadingHistory}
        icon={Heart}
        emptyMessage="You haven't favorited any stories yet. Tap the heart on a story page to add it here!"
      />

      <StoryListCard 
        title="Reading History"
        stories={readStories.slice(0, 10)} // Show most recent 10
        isLoading={isLoadingHistory}
        icon={History}
        emptyMessage="You haven't read any stories yet. Start reading to build your history!"
      />
      
      <TransactionHistoryCard 
        unlockedStories={userProfile.unlockedStories}
        coinPurchases={coinTransactions}
        storiesMap={storiesMap}
        isLoading={isLoadingHistory}
      />

      <Separator />

      <div className="text-center mt-8">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
