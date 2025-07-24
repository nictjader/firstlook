
"use client";

import type { Story } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useMemo, useState, useEffect } from 'react';
import { capitalizeWords } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type StoryCardProps = {
  story: Story;
  isPriority?: boolean;
};

export default function StoryCard({ story, isPriority = false }: StoryCardProps) {
  const { title, coverImageUrl, coinCost, storyId, subgenre } = story;
  const { user, userProfile, toggleFavoriteStory, loading: authLoading } = useAuth();
  const [isRead, setIsRead] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isFavorited = useMemo(() => {
    if (authLoading || !userProfile) return false;
    return userProfile.favoriteStories?.includes(storyId) ?? false;
  }, [authLoading, userProfile, storyId]);
  
  useEffect(() => {
    if (user && userProfile) {
      setIsRead(userProfile.readStories?.includes(storyId) ?? false);
    } else if (typeof window !== 'undefined') {
      try {
        const localReadJson = localStorage.getItem('siren_read_stories');
        const localReadStories: string[] = localReadJson ? JSON.parse(localReadJson) : [];
        setIsRead(localReadStories.includes(storyId));
      } catch (error) {
        console.error("Failed to parse read stories from localStorage", error);
        setIsRead(false);
      }
    }
  }, [user, userProfile, storyId, authLoading]);


  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) {
        router.push('/login?reason=favorite');
        return;
    }
    toggleFavoriteStory(storyId);
    toast({
        variant: 'success',
        title: isFavorited ? 'Removed from Favorites' : 'Added to Favorites',
    });
  }

  const isPremium = coinCost > 0;
  const placeholderImage = 'https://placehold.co/600x900/D87093/F9E4EB.png?text=FirstLook';
  const subgenreText = capitalizeWords(subgenre).replace(" Romance", "");

  if (authLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="w-full bg-muted aspect-[2/3] rounded-lg" />
        <div className="flex justify-end items-center h-5 gap-3 px-1">
          <Skeleton className="w-5 h-5 rounded-full" />
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-2">
       <Link href={`/stories/${storyId}`} aria-label={`Read ${title}`} className="group block">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">{subgenreText}</p>
              <h3 className="text-lg font-headline font-bold leading-tight mt-1 line-clamp-2 h-[2.5em]">
                {title.replace(/ - Part \d+$/, '')}
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
