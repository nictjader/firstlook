
"use client";

import type { Story } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Lock, Heart, Library } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useMemo } from 'react';
import { capitalizeWords } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type StoryCardProps = {
  story: Story;
  isPriority?: boolean;
};

export default function StoryCard({ story, isPriority = false }: StoryCardProps) {
  const { title, coverImageUrl, coinCost, storyId, subgenre, seriesId, totalPartsInSeries, partNumber } = story;
  const { userProfile } = useAuth();
  
  const isFavorited = useMemo(() => {
    if (!userProfile) return false;
    return userProfile.favoriteStories?.includes(storyId) ?? false;
  }, [userProfile, storyId]);

  const isFree = coinCost <= 0;
  const isSeries = seriesId && totalPartsInSeries && totalPartsInSeries > 1;

  const placeholderImage = 'https://placehold.co/600x900/D87093/F9E4EB.png?text=FirstLook';
  
  const subgenreText = capitalizeWords(subgenre).replace(" Romance", "");
  
  return (
    <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`} className="block group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="w-full bg-muted aspect-[2/3] relative">
        <Image
          src={coverImageUrl || placeholderImage}
          alt={title || "Story cover"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          data-ai-hint="romance book cover"
          priority={isPriority}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Top-aligned content: Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className='flex flex-col gap-2'>
            {isSeries ? (
              <Badge variant="secondary" className="flex items-center text-xs shadow-md w-fit">
                Part 1 Free
              </Badge>
            ) : (
               <Badge variant={isFree ? 'secondary' : 'destructive'} className="flex items-center text-xs shadow-md w-fit">
                {!isFree && <Lock className="w-3 h-3 mr-1" />}
                {isFree ? 'Free' : 'Premium'}
              </Badge>
            )}

            {isSeries && (
              <Badge variant="outline" className="flex items-center text-xs shadow-md bg-black/50 text-white w-fit">
                <Library className="w-3 h-3 mr-1" />
                {totalPartsInSeries}-Part Series
              </Badge>
            )}
          </div>
          {isFavorited && (
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
            </div>
          )}
        </div>

        {/* Bottom-aligned content: Title and Subgenre */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">{subgenreText}</p>
          <h3 className="text-lg font-headline font-bold leading-tight mt-1 line-clamp-2 h-[2.5em]">
             {title.replace(/ - Part \d+$/, '')}
          </h3>
        </div>
      </div>
    </Link>
  );
}
