
"use client";

import type { Story } from '../../lib/types';
import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Coins, Heart, Library, Sun, Moon, ZoomIn, ZoomOut, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { useRouter } from 'next/navigation';
import { capitalizeWords, cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useTheme } from 'next-themes';
import StoryCard from './story-card';
import { arrayUnion, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase/client';
import { doc } from 'firebase/firestore';
import { useEffectOnce } from '../../hooks/use-effect-once';
import { PLACEHOLDER_IMAGE_URL } from '../../lib/config';

const FONT_SIZES = [
  'text-base',   // 16px
  'text-lg',     // 18px
  'text-xl',     // 20px
  'text-2xl',    // 24px
  'text-3xl',    // 30px
];

const DEFAULT_FONT_SIZE_INDEX = 1;

export default function ReaderView({ story, seriesParts }: { story: Story; seriesParts: Story[] }) {
  const { user, userProfile, updateUserProfile, refreshUserProfile, toggleFavoriteStory, markStoryAsRead } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [isLoadingUnlock, setIsLoadingUnlock] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [currentFontSizeIndex, setCurrentFontSizeIndex] = useState(DEFAULT_FONT_SIZE_INDEX);

  const isEffectivelyFree = !story.isPremium || story.coinCost <= 0;
  
  const userUnlockedStoryIds = useMemo(() => 
    new Set(userProfile?.unlockedStories.map(s => s.storyId) ?? [])
  , [userProfile?.unlockedStories]);

  const isUnlocked = isEffectivelyFree || userUnlockedStoryIds.has(story.storyId);
  
  const isFavorited = userProfile?.favoriteStories.includes(story.storyId) ?? false;
  
  useEffectOnce(() => {
    if (isUnlocked) {
      markStoryAsRead(story.storyId);
    }
  });


  // --- Series Pass Logic ---
  const isSeries = !!story.seriesId;
  const remainingChaptersInSeries = useMemo(() => {
    if (!isSeries) return [];
    return seriesParts
      .filter(part => part.isPremium && !userUnlockedStoryIds.has(part.storyId))
      .sort((a, b) => (a.partNumber ?? 0) - (b.partNumber ?? 0));
  }, [seriesParts, isSeries, userUnlockedStoryIds]);
  
  const singleChapterCost = story.coinCost;
  const seriesPassCost = useMemo(() => {
    const totalCost = remainingChaptersInSeries.reduce((sum, part) => sum + part.coinCost, 0);
    // Apply a ~15% discount, rounded to the nearest 5 coins
    return Math.round((totalCost * 0.85) / 5) * 5;
  }, [remainingChaptersInSeries]);

  const fullPrice = remainingChaptersInSeries.reduce((sum, part) => sum + part.coinCost, 0);
  const canAffordSingle = (userProfile?.coins ?? 0) >= singleChapterCost;
  const canAffordSeries = (userProfile?.coins ?? 0) >= seriesPassCost;
  // --- End Series Pass Logic ---


  const changeFontSize = (direction: 'increase' | 'decrease') => {
    setCurrentFontSizeIndex((prevIndex) => {
      const newIndex = direction === 'increase' ? prevIndex + 1 : prevIndex - 1;
      return Math.max(0, Math.min(newIndex, FONT_SIZES.length - 1));
    });
  };

  const handleSingleChapterUnlock = async () => {
    if (!user || !userProfile || !canAffordSingle || isEffectivelyFree) return;
    
    setIsLoadingUnlock(true);
    try {
      const newCoinBalance = userProfile.coins - singleChapterCost;
      const newUnlockRecord = { storyId: story.storyId, unlockedAt: new Date().toISOString() };
      
      await updateUserProfile({ 
        coins: newCoinBalance,
        unlockedStories: arrayUnion(newUnlockRecord) as any
      });

      await refreshUserProfile();
      toast({ variant: "success", title: "Chapter Unlocked!", description: `You can now read "${story.title}".` });
      setShowUnlockModal(false);
    } catch (error) {
      console.error("Error unlocking single chapter:", error);
      toast({ title: "Unlock Failed", description: "Could not unlock this chapter. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingUnlock(false);
    }
  };
  
  const handleSeriesPassUnlock = async () => {
    if (!user || !userProfile || !canAffordSeries || !isSeries) return;

    setIsLoadingUnlock(true);
    try {
        const newCoinBalance = userProfile.coins - seriesPassCost;
        const batch = writeBatch(db);

        const newUnlockRecords = remainingChaptersInSeries.map(part => ({
            storyId: part.storyId,
            unlockedAt: new Date().toISOString()
        }));

        const userDocRef = doc(db, "users", user.uid);
        batch.update(userDocRef, {
            coins: newCoinBalance,
            unlockedStories: arrayUnion(...newUnlockRecords)
        });

        await batch.commit();
        await refreshUserProfile();

        toast({
            variant: 'success',
            title: 'Series Unlocked!',
            description: `You now have access to the rest of "${story.seriesTitle}". Enjoy!`
        });
        setShowUnlockModal(false);

    } catch (error) {
        console.error("Error unlocking series:", error);
        toast({ title: 'Series Unlock Failed', description: 'Could not unlock the series. Please try again.', variant: 'destructive' });
    } finally {
        setIsLoadingUnlock(false);
    }
};

  const handleFavoriteClick = () => {
    if (!user) {
      router.push('/login?reason=favorite');
      return;
    }
    toggleFavoriteStory(story.storyId);
  };
  
  const otherParts = seriesParts.filter(part => part.storyId !== story.storyId);
  const subgenreText = capitalizeWords(story.subgenre).replace(" Romance", "");
  const displayTitle = story.seriesTitle ? story.seriesTitle : story.title;


  const ReadingControls = () => (
    <div className="flex justify-between items-center bg-muted/30 px-6 py-2">
      <p className="text-sm text-muted-foreground">Reading Controls</p>
      <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={() => changeFontSize('decrease')} aria-label="Decrease font size">
              <ZoomOut className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => changeFontSize('increase')} aria-label="Increase font size">
              <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
      </div>
    </div>
  );
  
  const renderUnlockDialogContent = () => {
    if (!user) {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Sign In to Continue</DialogTitle>
                    <DialogDescription>
                        Create a free account or sign in to unlock stories and build your library.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                     <Button variant="outline" onClick={() => setShowUnlockModal(false)}>Cancel</Button>
                     <Button asChild className="bg-accent hover:bg-accent/90">
                        <Link href={`/login?redirect=/stories/${story.storyId}`}>Sign In</Link>
                    </Button>
                </DialogFooter>
            </>
        )
    }

    // Single Chapter Story or Last Chapter of a series
    if (!isSeries || remainingChaptersInSeries.length <= 1) {
        const canAfford = (userProfile?.coins ?? 0) >= singleChapterCost;
        return (
            <>
                <DialogHeader>
                    <DialogTitle>{canAfford ? "Unlock Chapter?" : "Not Enough Coins"}</DialogTitle>
                    <DialogDescription>
                    {canAfford
                        ? `This will use ${singleChapterCost} coins from your balance to permanently unlock this chapter.`
                        : `You need ${singleChapterCost} coins for this chapter, but you only have ${userProfile?.coins ?? 0}.`
                    }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUnlockModal(false)} disabled={isLoadingUnlock}>Cancel</Button>
                    {canAfford ? (
                    <Button onClick={handleSingleChapterUnlock} disabled={isLoadingUnlock} className="bg-accent hover:bg-accent/90">
                        {isLoadingUnlock ? "Unlocking..." : `Yes, Unlock for ${singleChapterCost} Coins`}
                    </Button>
                    ) : (
                    <Button asChild className="bg-accent hover:bg-accent/90">
                        <Link href={`/buy-coins?redirect=/stories/${story.storyId}`}>Purchase Coins</Link>
                    </Button>
                    )}
                </DialogFooter>
            </>
        )
    }
    
    // Multi-option for a series
    return (
      <>
        <DialogHeader>
            <DialogTitle>Unlock Your Next Adventure</DialogTitle>
            <DialogDescription>
                Choose how you want to continue the story. Your current balance is {userProfile?.coins ?? 0} coins.
            </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Option A: Single Chapter */}
            <div className={cn("rounded-lg border p-4 flex flex-col", !canAffordSingle && "bg-muted/50 text-muted-foreground")}>
                <h3 className="font-semibold text-lg">Unlock Next Chapter</h3>
                <p className="text-sm text-muted-foreground flex-grow">Just want to read the next part? No problem.</p>
                <div className="text-center my-4">
                    <p className="text-3xl font-bold">{singleChapterCost}</p>
                    <p className="text-sm font-semibold flex items-center justify-center"><Coins className="w-4 h-4 mr-1 text-yellow-500"/>Coins</p>
                </div>
                <Button onClick={handleSingleChapterUnlock} disabled={isLoadingUnlock || !canAffordSingle} className="w-full mt-auto">
                    {isLoadingUnlock ? "Processing..." : "Unlock Chapter"}
                </Button>
            </div>

            {/* Option B: Series Pass */}
            <div className={cn("rounded-lg border-2 border-primary p-4 flex flex-col relative", !canAffordSeries && "border-muted-foreground bg-muted/50 text-muted-foreground")}>
                 <Badge variant="premium" className="absolute -top-3 left-1/2 -translate-x-1/2"><Sparkles className="w-3.5 h-3.5 mr-1"/> Best Value</Badge>
                <h3 className="font-semibold text-lg">Unlock Full Series</h3>
                <p className="text-sm text-muted-foreground flex-grow">Binge the rest! Get all {remainingChaptersInSeries.length} remaining chapters.</p>
                <div className="text-center my-4">
                    <p className="text-3xl font-bold">{seriesPassCost}</p>
                    <p className="text-sm font-semibold flex items-center justify-center"><Coins className="w-4 h-4 mr-1 text-yellow-500"/>Coins</p>
                    <p className="text-xs text-muted-foreground line-through">Was {fullPrice} Coins</p>
                </div>
                <Button onClick={handleSeriesPassUnlock} disabled={isLoadingUnlock || !canAffordSeries} className="w-full mt-auto bg-accent hover:bg-accent/90">
                    {isLoadingUnlock ? "Processing..." : "Get Series Pass"}
                </Button>
            </div>
        </div>
        {!canAffordSingle && (
            <div className="text-center">
                 <Button asChild variant="secondary">
                    <Link href={`/buy-coins?redirect=/stories/${story.storyId}`}>Not enough coins? Buy more.</Link>
                </Button>
            </div>
        )}
      </>
    );
  };


  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
       <Link href="/" className="text-sm inline-flex items-center text-primary hover:underline mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Library
        </Link>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden shadow-xl">
        <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-muted">
           <Image
              src={story.coverImageUrl || PLACEHOLDER_IMAGE_URL}
              alt={`Cover for ${story.title}`}
              fill
              className="object-cover object-top"
              priority
              data-ai-hint="romance book cover"
            />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{subgenreText}</p>
                   <div className="flex items-center gap-x-2 text-muted-foreground">
                    {story.isPremium && !isUnlocked && <Coins className="h-4 w-4" />}
                    {story.isPremium && isUnlocked && (
                      <Badge variant="premium"><CheckCircle className="h-3.5 w-3.5 mr-1"/> Unlocked</Badge>
                    )}
                  </div>
                </div>
               <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline font-semibold leading-none tracking-tight text-primary !mb-2">{displayTitle}</h3>
                {story.seriesTitle && story.partNumber && (
                  <p className="text-accent font-medium mt-1 flex items-center text-sm sm:text-base">
                    <Library className="w-4 h-4 mr-1.5" />
                     Chapter {story.partNumber} of {story.totalPartsInSeries}
                  </p>
                )}
                 <div className="mt-4 text-muted-foreground">
                    {story.synopsis}
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center">
               <Button variant="ghost" size="icon" onClick={handleFavoriteClick} aria-label="Favorite this story">
                <Heart className={`h-6 w-6 transition-colors duration-200 ${isFavorited ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
              </Button>
            </div>
          </div>
        </div>
        
        {isUnlocked ? (
          <>
            <Separator />
            <ReadingControls />
            <Separator />
            <div className={`py-6 px-6 prose dark:prose-invert max-w-none ${FONT_SIZES[currentFontSizeIndex]} font-body`}>
                <div dangerouslySetInnerHTML={{ __html: story.content }} />
            </div>
          </>
        ) : (
           <div className="relative">
             <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-t from-card via-card/80 to-transparent" />
             <div className="p-6 text-center relative">
                 <p className="text-lg font-semibold text-primary">This is a Premium Chapter</p>
                 <p className="flex items-center justify-center text-muted-foreground">Unlock this story to continue reading.</p>
                 <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
                     <Button size="lg" className="w-full max-w-xs h-12 text-lg mt-4" onClick={() => setShowUnlockModal(true)}>
                         <Lock className="mr-2 h-5 w-5"/>Unlock Options
                     </Button>
                     <DialogContent className="max-w-2xl">
                        {renderUnlockDialogContent()}
                     </DialogContent>
                 </Dialog>
             </div>
           </div>
        )}

      </div>

      {otherParts.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-xl flex items-center font-semibold leading-none tracking-tight">
              <Library className="w-5 h-5 mr-2 text-primary" />
              More from {story.seriesTitle || 'this series'}
            </h3>
            <p className="text-sm text-muted-foreground">Follow the rest of the story. Chapters are displayed in order.</p>
          </div>
          <div className="p-6 pt-0">
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {otherParts.map(part => (
                <StoryCard key={part.storyId} story={part} showChapterInfo={true} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

    