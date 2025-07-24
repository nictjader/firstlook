
"use client";

import type { Story } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useMemo, useState, useEffect } from 'react';
import { capitalizeWords } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StoryCardProps = {
  story: Story;
  isPriority?: boolean;
};

const LOCAL_STORAGE_READ_KEY = 'siren_read_stories';

export default function StoryCard({ story, isPriority = false }: StoryCardProps) {
  const { title, coverImageUrl, coinCost, storyId, subgenre } = story;
  const { user, userProfile, toggleFavoriteStory } = useAuth();
  const [isRead, setIsRead] = useState(false);

  const isFavorited = useMemo(() => {
    if (!userProfile) return false;
    return userProfile.favoriteStories?.includes(storyId) ?? false;
  }, [userProfile, storyId]);

  useEffect(() => {
    if (user && userProfile) {
      setIsRead(userProfile.readStories?.includes(storyId) ?? false);
    } else if (typeof window !== 'undefined') {
      try {
        const localReadJson = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
        const localReadStories: string[] = localReadJson ? JSON.parse(localReadJson) : [];
        setIsRead(localReadStories.includes(storyId));
      } catch (error) {
        setIsRead(false);
      }
    }
  }, [user, userProfile, storyId]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    toggleFavoriteStory(storyId);
  }

  const isFree = coinCost <= 0;
  const placeholderImage = 'https://placehold.co/600x900/D87093/F9E4EB.png?text=FirstLook';
  const subgenreText = capitalizeWords(subgenre).replace(" Romance", "");

  return (
    <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`} className="group flex flex-col h-full">
      <div className="w-full bg-muted aspect-[2/3] relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <Image
          src={coverImageUrl || placeholderImage}
          alt={title || "Story cover"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          data-ai-hint="romance book cover"
          priority={isPriority}
        />
        {isFavorited && (
          <Badge className="absolute top-2 right-2 bg-white text-primary hover:bg-white/90 shadow-lg">
            Favorite
          </Badge>
        )}
      </div>
      <div className="flex-grow pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{subgenreText}</p>
        <h3 className="text-base font-headline font-bold leading-tight mt-1 group-hover:text-primary transition-colors line-clamp-2 h-[2.8em]">
           {title.replace(/ - Part \d+$/, '')}
        </h3>
      </div>
      <div className="flex justify-end items-center mt-2 text-muted-foreground h-5 gap-2">
        {isRead && (
          <Tooltip text="Read">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </Tooltip>
        )}
        {!isFree && (
          <Tooltip text="Premium">
            <Lock className="w-4 h-4" />
          </Tooltip>
        )}
         {user && (
            <Tooltip text={isFavorited ? "Unfavorite" : "Favorite"}>
              <button onClick={handleFavoriteClick} className="p-1 -m-1 rounded-full hover:bg-secondary">
                 <Heart className={`w-5 h-5 transition-colors duration-200 ${isFavorited ? 'text-red-500 fill-current' : ''}`} />
              </button>
            </Tooltip>
          )}
      </div>
    </Link>
  );
}

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="relative group flex items-center">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      {text}
      <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
        <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
      </svg>
    </div>
  </div>
);

