
"use client";

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gem, Mail, UserCircle, LogOut, CheckSquare, Square, Edit3, Save, History, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { ALL_SUBGENRES, Subgenre } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Separator } from '../ui/separator';
import { capitalizeWords } from '@/lib/utils';
import StoryListCard from './story-list-card';
import PurchaseHistoryCard from './purchase-history-card';


export default function ProfileView() {
  const { user, userProfile, loading, updateUserProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [selectedSubgenres, setSelectedSubgenres] = useState<Subgenre[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Only update the local state if the profile's subgenres change.
    // This prevents unnecessary re-renders if other parts of the profile update.
    if (userProfile?.preferences.subgenres) {
      setSelectedSubgenres(userProfile.preferences.subgenres as Subgenre[]);
    }
  }, [userProfile?.preferences.subgenres]);

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

  const toggleSubgenre = (subgenre: Subgenre) => {
    setSelectedSubgenres(prev =>
      prev.includes(subgenre) ? prev.filter(s => s !== subgenre) : [...prev, subgenre]
    );
  };

  const handleSavePreferences = async () => {
    if (!user || !userProfile) return;
    setIsSaving(true);
    try {
      await updateUserProfile({ preferences: { subgenres: selectedSubgenres } });
      await refreshUserProfile(); 
      toast({ title: "Preferences Saved", description: "Your subgenre preferences have been updated." });
      setIsEditingPreferences(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!user || !userProfile) {
    router.push('/login');
    return <p>Redirecting to login...</p>;
  }

  const lastLoginDate = userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleString() : 'N/A';
  const memberSinceDate = userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A';


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserCircle className="h-12 w-12 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">
                {userProfile.displayName || userProfile.email || 'Siren User'}
              </CardTitle>
              <CardDescription>Manage your account details and preferences.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/>Email</Label>
            <Input id="email" value={userProfile.email || 'No email provided'} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center"><Gem className="w-4 h-4 mr-2 text-yellow-500"/>Coin Balance</Label>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
              <span className="text-xl font-semibold text-primary">{userProfile.coins} Coins</span>
              <Link href="/buy-coins">
                <Button variant="default" size="sm">Buy More Coins</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-headline">Reading Preferences</CardTitle>
              <CardDescription>Tell us what you love to read.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditingPreferences(!isEditingPreferences)}>
              {isEditingPreferences ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              <span className="sr-only">{isEditingPreferences ? "Save Preferences" : "Edit Preferences"}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingPreferences ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select your favorite subgenres:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_SUBGENRES.map(subgenre => (
                  <Button
                    key={subgenre}
                    variant={selectedSubgenres.includes(subgenre) ? "default" : "outline"}
                    onClick={() => toggleSubgenre(subgenre)}
                    className="flex items-center justify-start space-x-2"
                  >
                    {selectedSubgenres.includes(subgenre) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span>{capitalizeWords(subgenre)}</span>
                  </Button>
                ))}
              </div>
              <Button onClick={handleSavePreferences} disabled={isSaving} className="mt-4">
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          ) : (
            userProfile.preferences.subgenres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userProfile.preferences.subgenres.map(subgenre => (
                  <Badge key={subgenre} variant="secondary" className="text-sm px-3 py-1">{capitalizeWords(subgenre)}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">You haven&apos;t set any preferences yet. Click edit to select your favorite subgenres.</p>
            )
          )}
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
        storyIds={[...userProfile.readStories].reverse()} // Show most recent first
        icon={History}
        emptyMessage="You haven't read any stories yet. Start reading to build your history!"
      />

      <PurchaseHistoryCard 
        purchaseHistory={userProfile.purchaseHistory}
      />

      <Separator />

      <div className="text-center mt-8">
        <Button variant="destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>User ID: {userProfile.userId}</p>
        <p>Last Login: {lastLoginDate}</p>
         <p>Member Since: {memberSinceDate}</p>
      </div>
    </div>
  );
}
