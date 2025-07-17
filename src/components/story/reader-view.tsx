
"use client";

import type { Story } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Gem, Heart, BookOpen, Library } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';
import { capitalizeWords } from '@/lib/utils';
import { ReaderMode } from './reader-mode';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const FONT_SIZES = [
  'text-sm', // 14px
  'text-base', // 16px
  'text-lg', // 18px
  'text-xl', // 20px
  'text-2xl', // 24px
];


// --- Main View Component ---
export default function ReaderView({ story, seriesParts }: { story: Story; seriesParts: Story[] }) {
  const { user, userProfile, updateUserProfile, refreshUserProfile, toggleFavoriteStory } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoadingUnlock, setIsLoadingUnlock] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [currentFontSizeIndex, setCurrentFontSizeIndex] = useState(1);

  const isEffectivelyFree = useMemo(() => !story.isPremium || story.coinCost <= 0, [story.isPremium, story.coinCost]);
  const isUnlocked = useMemo(() => isEffectivelyFree || (userProfile?.unlockedStories.includes(story.storyId) ?? false), [story.storyId, userProfile, isEffectivelyFree]);
  const isFavorited = useMemo(() => userProfile?.favoriteStories.includes(story.storyId) ?? false, [story.storyId, userProfile]);
  const hasSufficientCoins = useMemo(() => isEffectivelyFree || !userProfile ? true : userProfile.coins >= story.coinCost, [story, userProfile, isEffectivelyFree]);

  const handleUnlockStory = async () => {
    if (!user || !userProfile || !hasSufficientCoins || isEffectivelyFree) {
      toast({ title: "Unlock Failed", description: "Conditions not met to unlock story.", variant: "destructive" });
      setShowUnlockModal(false);
      return;
    }
    setIsLoadingUnlock(true);
    try {
      const newCoinBalance = userProfile.coins - story.coinCost;
      await updateUserProfile({ 
        coins: newCoinBalance,
        unlockedStories: [...userProfile.unlockedStories, story.storyId] 
      });
      await refreshUserProfile();
      setShowUnlockModal(false);
      toast({ title: "Story Unlocked!", description: `You can now read "${story.title}".` });
    } catch (error) {
      console.error("Error unlocking story:", error);
      toast({ title: "Unlock Failed", description: "Could not unlock the story. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingUnlock(false);
    }
  };

  const handleFavoriteClick = () => {
    if (!user) {
      toast({ title: "Please Sign In", description: "You need to be signed in to favorite stories.", variant: "destructive" });
      router.push('/login');
      return;
    }
    toggleFavoriteStory(story.storyId);
  };

  const placeholderImage = 'https://placehold.co/1200x675/D87093/F9E4EB.png?text=Siren';
  if (!story) return <p>Story not found.</p>;

  if (isReaderMode) {
    return <ReaderMode story={story} onBack={() => setIsReaderMode(false)} initialFontSizeIndex={currentFontSizeIndex} />;
  }

  // This is the content that shows as a preview or a paywall when the story is locked
  const LockedContent = () => (
     <div className="space-y-4 pt-6 px-6">
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">{capitalizeWords(story.subgenre)}</Badge>
            {story.tags?.map(tag => <Badge key={tag} variant="outline" className="px-3 py-1 text-sm hidden sm:inline-flex">{capitalizeWords(tag)}</Badge>)}
        </div>
        <p className="text-base text-muted-foreground prose dark:prose-invert max-w-none">{story.previewText}</p>
        <div className="flex-col items-center gap-4 bg-muted/50 p-6 rounded-lg text-center mt-6">
          <p className="text-lg font-semibold text-primary">This is a Premium Story</p>
          <p className="flex items-center justify-center text-muted-foreground">Unlock this story for <Gem className="text-yellow-500 mx-1.5 h-5 w-5" /> {story.coinCost} coins.</p>
          <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
            <Button size="lg" className="w-full max-w-xs h-12 text-lg mt-4" onClick={() => setShowUnlockModal(true)}>
              <Lock className="mr-2 h-5 w-5"/>Unlock to Read
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{hasSufficientCoins ? "Unlock Story?" : "Not Enough Coins"}</DialogTitle>
                    <DialogDescription>
                    {hasSufficientCoins
                        ? `This will use ${story.coinCost} coins from your balance to permanently unlock "${story.title}".`
                        : `You need ${story.coinCost} coins to read this story, but you only have ${userProfile?.coins ?? 0}. Please purchase more coins.`
                    }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUnlockModal(false)} disabled={isLoadingUnlock}>Cancel</Button>
                    {hasSufficientCoins ? (
                    <Button onClick={handleUnlockStory} disabled={isLoadingUnlock} className="bg-accent hover:bg-accent/90">
                        {isLoadingUnlock ? "Unlocking..." : `Yes, unlock for ${story.coinCost} coins`}
                    </Button>
                    ) : (
                    <Link href="/buy-coins" passHref>
                        <Button className="bg-accent hover:bg-accent/90" onClick={() => setShowUnlockModal(false)}>
                        Buy Coins
                        </Button>
                    </Link>
                    )}
                </DialogFooter>
            </DialogContent>
          </Dialog>
           {!user && (
             <p className="text-sm mt-2 text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Sign In</Link>
             </p>
           )}
        </div>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
       <Link href="/" className="text-sm inline-flex items-center text-primary hover:underline mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Library
        </Link>
      <Card className="overflow-hidden shadow-xl">
        <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-muted">
           <Image
              src={story.coverImageUrl || placeholderImage}
              alt={`Cover for ${story.title}`}
              fill
              className="object-cover"
              priority
              data-ai-hint="romance book cover"
            />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
               <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-headline text-primary !mb-2">{story.title}</CardTitle>
                {story.seriesTitle && story.partNumber && (
                  <p className="text-accent font-medium mt-1 flex items-center text-sm sm:text-base">
                    <Library className="w-4 h-4 mr-1.5" />
                     Part {story.partNumber} of {story.seriesTitle}
                  </p>
                )}
            </div>
            <div className="flex-shrink-0 flex items-center">
               <Button variant="ghost" size="icon" onClick={handleFavoriteClick} aria-label="Favorite this story">
                <Heart className={`h-6 w-6 transition-colors duration-200 ${isFavorited ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isUnlocked ? (
          <CardContent className="pt-6 px-6">
             <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1 text-sm">{capitalizeWords(story.subgenre)}</Badge>
                    {story.tags?.map(tag => <Badge key={tag} variant="outline" className="px-3 py-1 text-sm hidden sm:inline-flex">{capitalizeWords(tag)}</Badge>)}
                </div>
                <p className="text-base text-muted-foreground prose dark:prose-invert max-w-none">{story.previewText}</p>
                 <Button size="lg" className="w-full h-12 text-lg" onClick={() => setIsReaderMode(true)}>
                    <BookOpen className="mr-2 h-5 w-5"/> Start Reading
                </Button>
             </div>
          </CardContent>
        ) : (
          <LockedContent />
        )}

      </Card>

      {/* Renders other parts of the series, if they exist AND there are more than just the current one */}
      {story.seriesId && seriesParts && seriesParts.length > 1 && (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center">
                    <Library className="w-5 h-5 mr-2 text-primary" />
                    More from {story.seriesTitle}
                </CardTitle>
                <CardDescription>Follow the rest of the story.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {seriesParts.map(part => (
                        // Do not show a link to the current story
                        part.storyId !== story.storyId && (
                            <Link key={part.storyId} href={`/stories/${part.storyId}`} passHref>
                                <Button
                                    variant="outline"
                                    className="w-full h-full text-left flex-col items-start p-3 justify-start"
                                >
                                    <span className="text-xs text-muted-foreground">Part {part.partNumber}</span>
                                    <span className="font-semibold truncate text-primary">{part.title}</span>
                                </Button>
                            </Link>
                        )
                    ))}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
