
"use client";

import type { Story } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Lock, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useMemo } from 'react';
import { capitalizeWords } from '@/lib/utils';

type StoryCardProps = {
  story: Story;
  isPriority?: boolean;
};

export default function StoryCard({ story, isPriority = false }: StoryCardProps) {
  const { title, coverImageUrl, coinCost, storyId, subgenre } = story;
  const { userProfile } = useAuth();
  
  const isFavorited = useMemo(() => userProfile?.favoriteStories?.includes(storyId) ?? false, [userProfile, storyId]);
  const isFree = coinCost <= 0;

  const placeholderImage = 'https://placehold.co/600x900/D87093/F9E4EB.png?text=FirstLook';
  
  const subgenreText = capitalizeWords(subgenre);
  
  return (
    <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`} className="block relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="w-full bg-muted aspect-[2/3] relative">
        <Image
          src={coverImageUrl || placeholderImage}
          alt={title || "Story cover"}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          data-ai-hint="romance book cover"
          priority={isPriority}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        {/* Top-aligned content: Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <Badge variant={isFree ? 'secondary' : 'destructive'} className="flex items-center text-xs shadow-md">
            {!isFree && <Lock className="w-3 h-3 mr-1" />}
            {isFree ? 'Free' : 'Premium'}
          </Badge>
          {isFavorited && (
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
            </div>
          )}
        </div>

        {/* Bottom-aligned content: Title and Subgenre */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">{subgenreText}</p>
          <h3 className="text-lg font-headline font-bold leading-tight mt-1 line-clamp-2">
             {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
