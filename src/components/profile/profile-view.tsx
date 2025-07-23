
"use client";

import { useAuth } from '@/contexts/auth-context';
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';


export default function ProfileView() {
  const { user, userProfile, loading, updateUserProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [selectedSubgenres, setSelectedSubgenres] = useState<Subgenre[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
              <CardDescription>Manage your account details and preferences.</CardDescription>
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

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-headline flex items-center"><Heart className="w-5 h-5 mr-2 text-primary"/>Reading Preferences</CardTitle>
            <CardDescription>Tell us what you love to read.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditingPreferences(!isEditingPreferences)}>
              {isEditingPreferences ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              <span className="sr-only">{isEditingPreferences ? "Save Preferences" : "Edit Preferences"}</span>
            </Button>
        </CardHeader>
        <CardContent>
          {isEditingPreferences ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select your favorite subgenres:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_SUBGENRES.map((subgenre: Subgenre) => (
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
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>User ID: {userProfile.userId}</p>
      </div>
    </div>
  );
}
