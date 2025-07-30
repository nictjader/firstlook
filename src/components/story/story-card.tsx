
"use client";

import type { Story } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { capitalizeWords } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/config';
import { Badge } from '@/components/ui/badge';

type StoryCardProps = {
  story: Story;
  isPriority?: boolean;
};

export default function StoryCard({ story, isPriority = false }: StoryCardProps) {
  const { title, coverImageUrl, coinCost, storyId, subgenre } = story;
  const { user, userProfile, toggleFavoriteStory } = useAuth();
  const router = useRouter();
  const [isRead, setIsRead] = useState(false);

  const isFavorited = userProfile?.favoriteStories?.includes(storyId) ?? false;
  
  useEffect(() => {
    if (userProfile) {
      setIsRead(userProfile.readStories?.includes(storyId) ?? false);
    } else {
      try {
        const localReadJson = window.localStorage.getItem('siren_read_stories');
        const localReadStories: string[] = localReadJson ? JSON.parse(localReadJson) : [];
        setIsRead(localReadStories.includes(storyId));
      } catch (error) {
        console.error("Failed to parse read stories from localStorage", error);
        setIsRead(false);
      }
    }
  }, [userProfile, storyId]);


  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) {
        router.push('/login?reason=favorite');
        return;
    }
    toggleFavoriteStory(storyId);
  }

  const isPremium = coinCost > 0;
  const subgenreText = capitalizeWords(subgenre).replace(" Romance", "");
  // This robustly removes " - Part X" from series titles for a clean card display.
  const displayTitle = title.replace(/ - Part \d+$/, '');


  return (
    <div className="space-y-2">
       <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`} className="group block">
        <div className="w-full bg-muted aspect-[2/3] relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <Image
            src={coverImageUrl || PLACEHOLDER_IMAGE_URL}
            alt={title || "Story cover"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="romance book cover"
            priority={isPriority}
          />
           {story.partNumber && (
            <Badge variant="secondary" className="absolute top-2 right-2 z-10">
              Part {story.partNumber}
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">{subgenreText}</p>
              <h3 className="text-lg font-headline font-bold leading-tight mt-1 line-clamp-2 h-[2.5em]">
                {displayTitle}
              </h3>
          </div>
        </div>
      </Link>
      <div className="flex justify-end items-center text-muted-foreground h-5 gap-3 px-1">
          {isPremium && <Lock className="w-4 h-4" />}
          {isRead && <CheckCircle2 className="w-4 h-4 text-primary" />}
          <button onClick={handleFavoriteClick} className="p-1 -m-1 rounded-full hover:bg-secondary">
              <Heart className={`w-5 h-5 transition-colors duration-200 ${isFavorited ? 'text-red-500 fill-current' : ''}`} />
          </button>
        </div>
    </div>
  );
}
