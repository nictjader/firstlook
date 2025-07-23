
"use client";

import type { Story } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Gem, Heart, Library, Sun, Moon, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/theme-context';

const FONT_SIZES = [
  'text-base',     // 16px
  'text-lg',     // 18px
  'text-xl',     // 20px
  'text-2xl',    // 24px
  'text-3xl',    // 30px
];

// --- Main View Component ---
export default function ReaderView({ story, seriesParts }: { story: Story; seriesParts: Story[] }) {
  const { user, userProfile, updateUserProfile, refreshUserProfile, toggleFavoriteStory, markStoryAsRead } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [isLoadingUnlock, setIsLoadingUnlock] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [currentFontSizeIndex, setCurrentFontSizeIndex] = useState(1);

  const isEffectivelyFree = useMemo(() => !story.isPremium || story.coinCost <= 0, [story.isPremium, story.coinCost]);
  const isUnlocked = useMemo(() => isEffectivelyFree || (userProfile?.unlockedStories.includes(story.storyId) ?? false), [story.storyId, userProfile, isEffectivelyFree]);
  const isFavorited = useMemo(() => userProfile?.favoriteStories.includes(story.storyId) ?? false, [story.storyId, userProfile]);
  const hasSufficientCoins = useMemo(() => isEffectivelyFree || !userProfile ? true : userProfile.coins >= story.coinCost, [story, userProfile, isEffectivelyFree]);

  useEffect(() => {
    if (isUnlocked) {
      markStoryAsRead(story.storyId);
    }
  }, [isUnlocked, story.storyId, markStoryAsRead]);


  const changeFontSize = (direction: 'increase' | 'decrease') => {
    setCurrentFontSizeIndex((prevIndex) => {
      const newIndex = direction === 'increase' ? prevIndex + 1 : prevIndex - 1;
      return Math.max(0, Math.min(newIndex, FONT_SIZES.length - 1));
    });
  };

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

  const placeholderImage = 'https://placehold.co/1200x675/D87093/F9E4EB.png?text=FirstLook';
  if (!story) return <p>Story not found.</p>;

  // This is the content that shows as a preview or a paywall when the story is locked
  const LockedContent = () => (
     <div className="space-y-4">
        <div className="px-6 pt-6">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-sm">{capitalizeWords(story.subgenre)}</Badge>
            </div>
            <p className="text-base text-muted-foreground prose dark:prose-invert max-w-none mt-4">{story.previewText}</p>
        </div>
        <div className="flex-col items-center gap-4 bg-muted/50 p-6 rounded-b-lg text-center">
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
                    <Link href="/buy-coins">
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
  
  const otherParts = seriesParts.filter(part => part.storyId !== story.storyId);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
       <Link href="/" className="text-sm inline-flex items-center text-primary hover:underline mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Library
        </Link>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden shadow-xl">
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
        <div className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
               <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline font-semibold leading-none tracking-tight text-primary !mb-2">{story.title}</h3>
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
        </div>
        
        {isUnlocked ? (
          <>
            <div className="px-6">
              <Separator />
            </div>
            <div className="px-6 py-2 border-b flex justify-between items-center bg-muted/30">
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
            <div className={`py-6 px-6 prose dark:prose-invert max-w-none ${FONT_SIZES[currentFontSizeIndex]}`}>
                <div dangerouslySetInnerHTML={{ __html: story.content }} />
            </div>
          </>
        ) : (
          <LockedContent />
        )}

      </div>

      {otherParts.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-xl flex items-center font-semibold leading-none tracking-tight">
              <Library className="w-5 h-5 mr-2 text-primary" />
              More from {story.seriesTitle || 'this series'}
            </h3>
            <p className="text-sm text-muted-foreground">Follow the rest of the story.</p>
          </div>
          <div className="p-6 pt-0">
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {otherParts.map(part => (
                <Link key={part.storyId} href={`/stories/${part.storyId}`} className="block group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <div className="w-full bg-muted aspect-[2/3] relative">
                         <Image
                            src={part.coverImageUrl || placeholderImage}
                            alt={`Cover for ${part.title}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint="romance book cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                             <Badge variant={part.coinCost > 0 ? 'destructive' : 'secondary'} className="flex items-center text-xs shadow-md w-fit">
                                {part.coinCost > 0 && <Lock className="w-3 h-3 mr-1" />}
                                {part.coinCost > 0 ? 'Premium' : 'Free'}
                            </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">Part {part.partNumber}</p>
                            <h3 className="text-lg font-headline font-bold leading-tight mt-1 line-clamp-2 h-[2.5em]">
                                {part.title.replace(/ - Part \d+.*$/, '')}
                            </h3>
                        </div>
                    </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
