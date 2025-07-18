
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Story, Subgenre } from '@/lib/types';
import StoryCard from './story-card';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getStories } from '@/app/actions/storyActions';
import { Skeleton } from '@/components/ui/skeleton';

interface StoryListProps {
  initialSubgenre: Subgenre | 'all';
}

const StoryListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);


function groupAndSortStories(stories: Story[]): Story[] {
  const storyMap = new Map<string, Story[]>();

  // Group stories by their primary sort key (seriesId or storyId)
  stories.forEach(story => {
    const key = story.primarySortKey;
    if (!storyMap.has(key)) {
      storyMap.set(key, []);
    }
    storyMap.get(key)!.push(story);
  });

  // Sort each group internally by part number (secondarySortKey)
  storyMap.forEach(group => {
    group.sort((a, b) => a.secondarySortKey - b.secondarySortKey);
  });

  // Flatten the map back into an array, keeping the original fetch order
  // which is based on publishedAt.
  const result: Story[] = [];
  const processedKeys = new Set<string>();

  stories.forEach(story => {
    const key = story.primarySortKey;
    if (!processedKeys.has(key)) {
      result.push(...(storyMap.get(key) || []));
      processedKeys.add(key);
    }
  });

  return result;
}


export default function StoryList({ initialSubgenre }: StoryListProps) {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSubgenre = (searchParams.get('subgenre') as Subgenre) || 'all';

  const loadMoreStories = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    
    const newStories = await getStories(lastPublishedAt);
    
    if (newStories.length > 0) {
      setAllStories((prev) => [...prev, ...newStories]);
      const lastStory = newStories[newStories.length - 1];
      setLastPublishedAt(lastStory.publishedAt);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [hasMore, isLoading, lastPublishedAt]);
  
  // Initial load effect
  useEffect(() => {
    setIsLoading(true);
    setAllStories([]);
    setLastPublishedAt(null);
    setHasMore(true);
    
    getStories(null).then((initialStories) => {
        if (initialStories.length > 0) {
            setAllStories(initialStories);
            const lastStory = initialStories[initialStories.length - 1];
            setLastPublishedAt(lastStory.publishedAt);
        } else {
            setHasMore(false);
        }
        setIsLoading(false);
    });
  }, []); 

  const displayedStories = useMemo(() => {
    const filtered = selectedSubgenre === 'all' 
      ? allStories 
      : allStories.filter(story => story.subgenre === selectedSubgenre);
    
    return groupAndSortStories(filtered);
  }, [allStories, selectedSubgenre]);

  if (allStories.length === 0 && isLoading) {
    return <StoryListSkeleton />;
  }

  if (displayedStories.length === 0 && !isLoading) {
    return (
      <div className="w-full text-center py-12 md:py-24 col-span-full space-y-4">
        <Separator/>
        <div className="mx-auto bg-secondary rounded-full p-4 w-fit mt-8">
            <BookX className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight">No Stories Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                It looks like there are no stories in this category yet. Please check back later or try a different subgenre.
            </p>
        </div>
        {selectedSubgenre !== 'all' && (
            <Button variant="outline" onClick={() => router.push('/')}>
                Clear Filter
            </Button>
        )}
        <Separator/>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayedStories.map((story, index) => (
          <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
        ))}
      </div>

      <div className="flex justify-center items-center col-span-full py-6">
        {hasMore ? (
          <Button onClick={loadMoreStories} disabled={isLoading}>
            {isLoading && allStories.length > 0 ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              'Load More'
            )}
          </Button>
        ) : (
          displayedStories.length > 0 && <p className="text-muted-foreground">You've reached the end!</p>
        )}
      </div>
    </>
  );
}
