
"use client";

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Gem, Mail, UserCircle, LogOut, History, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import StoryListCard from './story-list-card';
import PurchaseHistoryCard from './purchase-history-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';


export default function ProfileView() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!user || !userProfile) {
    router.push('/login');
    return <p>Redirecting to login...</p>;
  }

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
            <Label htmlFor="email" className="flex items-center text-sm font-semibold"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/>Email</Label>
            <Input id="email" value={userProfile.email || 'No email provided'} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center text-sm font-semibold"><Gem className="w-4 h-4 mr-2 text-yellow-500"/>Coin Balance</Label>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-2xl font-bold text-primary">{userProfile.coins} Coins</span>
              <Button asChild variant="default" size="sm">
                 <Link href="/buy-coins">Buy More Coins</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <StoryListCard 
        title="Favorite Stories" 
        storyIds={userProfile.favoriteStories}
        icon={Heart}
        emptyMessage="You haven't favorited any stories yet. Tap the heart on a story page to add it here!"
      />

      <StoryListCard 
        title="Reading History"
        storyIds={[...userProfile.readStories].reverse()} 
        icon={History}
        emptyMessage="You haven't read any stories yet. Start reading to build your history!"
      />

      <PurchaseHistoryCard 
        purchaseHistory={userProfile.purchaseHistory}
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
