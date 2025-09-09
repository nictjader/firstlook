
"use client";

import { useAuth } from '../../contexts/auth-context';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Coins, Mail, UserCircle, LogOut, History, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '../../hooks/use-toast';
import { Separator } from '../ui/separator';
import StoryListCard from './story-list-card';
import TransactionHistoryCard from './transaction-history-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { useState, useEffect } from 'react';
import { type Story, type CoinTransaction } from '../../lib/types';
import { getStoriesByIds } from '../../lib/actions/storyActions';
import { getCoinPurchaseHistory } from '../../lib/actions/paymentActions';
import { Skeleton } from '../ui/skeleton';

export default function ProfileView() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [storiesMap, setStoriesMap] = useState<Map<string, Story>>(new Map());
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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
  }, [user, userProfile, authLoading, toast]);


  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
            <Label className="flex items-center text-sm font-semibold"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/>Email Address</Label>
            <div className="flex items-center justify-between p-2 pl-4 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">{userProfile.email || 'No email provided'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center text-sm font-semibold"><Coins className="w-4 h-4 mr-2 text-yellow-500"/>Coin Balance</Label>
            <div className="flex items-center justify-between p-2 pl-4 bg-muted/30 rounded-lg">
                <span className="text-xl font-bold text-primary">{userProfile.coins.toLocaleString()} Coins</span>
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
