

"use client";

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Gem, Mail, UserCircle, LogOut, History, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import StoryListCard from './story-list-card';
import TransactionHistoryCard from './transaction-history-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';

export default function ProfileView() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);


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
        description: `A link to verify your new email has been sent to ${newEmail}. Please click the link to complete the update.`,
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
                {userProfile.displayName || userProfile.email || 'Siren User'}
              </CardTitle>
              <CardDescription>Manage your account details.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center text-sm font-semibold"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/>Email</Label>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground bg-muted/50 px-3 py-2 rounded-md w-full">{userProfile.email || 'No email provided'}</p>
               <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-4 flex-shrink-0">Change</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Your Email Address</DialogTitle>
                    <DialogDescription>
                      Enter your new email address below. We'll send a verification link to confirm the change. Your email will not be updated until you click the link.
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
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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

      <TransactionHistoryCard 
        purchaseHistory={userProfile.purchaseHistory}
        unlockedStories={userProfile.unlockedStories}
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
