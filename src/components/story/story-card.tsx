
"use client";

import type { Story } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Lock, Gem, BookOpen, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useMemo } from 'react';

type StoryCardProps = {
  story: Story;
  isPriority?: boolean;
};

export default function StoryCard({ story, isPriority = false }: StoryCardProps) {
  const { title, previewText, coverImageUrl, coinCost, storyId, subgenre, seriesId, seriesTitle, partNumber, totalPartsInSeries } = story;
  const { userProfile } = useAuth();
  
  const isFavorited = useMemo(() => userProfile?.favoriteStories?.includes(storyId) ?? false, [userProfile, storyId]);
  const isFree = coinCost <= 0;

  const placeholderImage = 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Siren';
  
  return (
    <div className="flex flex-col overflow-hidden h-full rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="p-0 relative">
        <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`}>
          <div className="w-full bg-muted aspect-[2/3] relative">
            <Image
              src={coverImageUrl || placeholderImage}
              alt={title || "Story cover"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover object-top"
              data-ai-hint="romance book cover"
              priority={isPriority}
            />
          </div>
        </Link>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="truncate text-xs px-1.5 py-0.5 sm:text-sm sm:px-2.5 sm:py-0.5">{subgenre}</Badge>
        </div>
        <div className="absolute top-2 right-2">
            {!isFree && (
              <Badge variant="destructive" className="flex-shrink-0 flex items-center text-xs px-1.5 py-0.5 sm:text-sm sm:px-2.5 sm:py-0.5">
                <Lock className="w-3 h-3 mr-1" /> Premium
              </Badge>
            )}
        </div>
        {isFavorited && (
           <div className="absolute bottom-2 right-2 bg-background/80 rounded-full p-1.5">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
           </div>
        )}
      </div>
      <div className="p-3 sm:p-4 flex-grow">
        <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`}>
          <h3 className="text-sm sm:text-base font-headline font-semibold leading-none tracking-tight mb-1 sm:mb-1.5 hover:text-primary transition-colors line-clamp-3">{title}</h3>
        </Link>
        
        <div className="h-5 mb-1.5 flex items-center text-xs text-muted-foreground">
            {(seriesId && partNumber && totalPartsInSeries && totalPartsInSeries > 1) ? (
                 <Badge variant="outline" className="text-[10px] font-medium leading-none border-accent/50 text-accent">
                    Part {partNumber} of {totalPartsInSeries}
                 </Badge>
            ) : (
                <Badge variant="outline" className="text-[10px] font-medium leading-none">Standalone</Badge>
            )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{previewText}</p>
      </div>
      <div className="p-3 sm:p-4 flex justify-between items-center gap-2">
        <div className="h-6 flex items-center">
            {isFree ? (
              <Badge variant="success" className="text-xs sm:text-sm">Free</Badge>
            ) : (
                <div className="flex items-center text-primary font-semibold text-xs sm:text-sm">
                <Gem className="w-4 h-4 mr-1 text-yellow-500" /> {coinCost} Coins
                </div>
            )}
        </div>
        <Link href={`/stories/${storyId}`} passHref>
          <Button variant="default" size="sm">
            {isFree ? <BookOpen className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            Read
          </Button>
        </Link>
      </div>
    </div>
  );
}
