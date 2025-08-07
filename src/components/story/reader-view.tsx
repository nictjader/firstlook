
"use client";

import type { Story } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Coins, Heart, Library, Sun, Moon, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';
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
import { useTheme } from 'next-themes';
import StoryCard from './story-card';
import { arrayUnion } from 'firebase/firestore';
import { useEffectOnce } from '@/hooks/use-effect-once';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/config';

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
  const isUnlockedByUser = userProfile?.unlockedStories.some(s => s.storyId === story.storyId) ?? false;
  const isUnlocked = isEffectivelyFree || isUnlockedByUser;

  const isFavorited = userProfile?.favoriteStories.includes(story.storyId) ?? false;
  const hasSufficientCoins = isEffectivelyFree || !userProfile ? true : userProfile.coins >= story.coinCost;

  useEffectOnce(() => {
    if (isUnlocked) {
      markStoryAsRead(story.storyId);
    }
  });


  const changeFontSize = (direction: 'increase' | 'decrease') => {
    setCurrentFontSizeIndex((prevIndex) => {
      const newIndex = direction === 'increase' ? prevIndex + 1 : prevIndex - 1;
      return Math.max(0, Math.min(newIndex, FONT_SIZES.length - 1));
    });
  };

  const handleUnlockStory = async () => {
    if (!user || !userProfile || !hasSufficientCoins || isEffectivelyFree) {
      setShowUnlockModal(false);
      return;
    }
    setIsLoadingUnlock(true);
    try {
      const newCoinBalance = userProfile.coins - story.coinCost;
      const newUnlockRecord = { storyId: story.storyId, unlockedAt: new Date().toISOString() };
      
      await updateUserProfile({ 
        coins: newCoinBalance,
        unlockedStories: arrayUnion(newUnlockRecord) as any // Use arrayUnion for atomicity
      });
      await refreshUserProfile();
      toast({ variant: "success", title: "Story Unlocked!", description: `You can now read "${story.title}".` });
      setShowUnlockModal(false);
    } catch (error) {
      console.error("Error unlocking story:", error);
      toast({ title: "Unlock Failed", description: "Could not unlock this story. Please try again.", variant: "destructive" });
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
                    {story.isPremium && !isUnlocked && <Lock className="h-4 w-4" />}
                    {story.isPremium && isUnlockedByUser && (
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
                 <p className="text-lg font-semibold text-primary">This is a Premium Story</p>
                 <p className="flex items-center justify-center text-muted-foreground">Unlock this story for <Coins className="text-yellow-500 mx-1.5 h-5 w-5" /> {story.coinCost} coins.</p>
                 <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
                     <Button size="lg" className="w-full max-w-xs h-12 text-lg mt-4" onClick={() => {
                       if (user) {
                         setShowUnlockModal(true);
                       } else {
                         router.push(`/login?redirect=/stories/${story.storyId}`);
                       }
                     }}>
                         <Lock className="mr-2 h-5 w-5"/>Unlock to Read
                     </Button>
                     <DialogContent>
                         <DialogHeader>
                             <DialogTitle>{hasSufficientCoins ? "Unlock Story?" : "Not Enough Coins"}</DialogTitle>
                             <DialogDescription>
                             {hasSufficientCoins
                                 ? `This will use ${story.coinCost} coins from your balance to permanently unlock "${story.title}".`
                                 : `You need ${story.coinCost} coins to read this story, but you only have ${userProfile?.coins ?? 0}.`
                             }
                             </DialogDescription>
                         </DialogHeader>
                         <DialogFooter>
                             <Button variant="outline" onClick={() => setShowUnlockModal(false)} disabled={isLoadingUnlock}>Cancel</Button>
                             {hasSufficientCoins ? (
                             <Button onClick={handleUnlockStory} disabled={isLoadingUnlock} className="bg-accent hover:bg-accent/90">
                                 {isLoadingUnlock ? "Unlocking..." : `Yes, Unlock for ${story.coinCost} Coins`}
                             </Button>
                             ) : (
                              <Button asChild className="bg-accent hover:bg-accent/90">
                                <Link href={`/buy-coins?redirect=/stories/${story.storyId}`}>Purchase Coins</Link>
                              </Button>
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
