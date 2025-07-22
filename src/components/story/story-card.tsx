
"use client";

import type { Story } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Lock, Gem, BookOpen, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useMemo } from 'react';
import { capitalizeWords } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type StoryCardProps = {
  story: Story;
  isPriority?: boolean;
};

export default function StoryCard({ story, isPriority = false }: StoryCardProps) {
  const { title, previewText, coverImageUrl, coinCost, storyId, subgenre, seriesId, partNumber, totalPartsInSeries } = story;
  const { userProfile } = useAuth();
  
  const isFavorited = useMemo(() => userProfile?.favoriteStories?.includes(storyId) ?? false, [userProfile, storyId]);
  const isFree = coinCost <= 0;

  const placeholderImage = 'https://placehold.co/600x900/D87093/F9E4EB.png?text=FirstLook';
  
  const subgenreText = capitalizeWords(subgenre);
  
  return (
    <div className="flex flex-col overflow-hidden h-full rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
      <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`} className="block relative">
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
           <div className="absolute top-2 right-2">
             {isFavorited && (
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
            )}
           </div>
        </div>
      </Link>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {subgenreText}
            </Badge>
            {!isFree && (
              <Badge variant="destructive" className="flex items-center text-xs">
                <Lock className="w-3 h-3 mr-1" /> Premium
              </Badge>
            )}
        </div>

        <h3 className="text-base font-headline font-semibold leading-tight mb-2 hover:text-primary transition-colors min-h-[2.5rem] line-clamp-2">
           <Link href={`/stories/${storyId}`}>{title}</Link>
        </h3>
        
        <div className="h-6 mb-2 flex items-center text-xs text-muted-foreground">
            {(seriesId && partNumber && totalPartsInSeries && totalPartsInSeries > 1) ? (
                 <Badge variant="outline" className="text-xs font-medium">
                    Part {partNumber} of {totalPartsInSeries}
                 </Badge>
            ) : (
                <Badge variant="outline" className="text-xs font-medium">Standalone</Badge>
            )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{previewText}</p>
      </div>
      <div className="p-4 pt-3 mt-auto border-t">
        <Link href={`/stories/${storyId}`} passHref>
          <Button variant="default" size="sm" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            <div className="flex items-center justify-center">
                <span>Read Now</span>
                {!isFree && (
                    <>
                        <Separator orientation="vertical" className="h-4 mx-2 bg-primary-foreground/50" />
                        <div className="flex items-center">
                            <Gem className="w-3 h-3 mr-1" />
                            <span>{coinCost}</span>
                        </div>
                    </>
                )}
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
