
'use client';

import { useState, useEffect, useCallback, useTransition, useMemo } from 'react';
import type { Story, Subgenre } from '@/lib/types';
import StoryCard from './story-card';
import { useRouter } from 'next/navigation';
import { BookX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useInView } from 'react-intersection-observer';
import { getStories } from '@/app/actions/storyActions';
import { Skeleton } from '@/components/ui/skeleton';

const STORIES_PER_PAGE = 12;

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

export default function StoryList({ initialSubgenre }: StoryListProps) {
  const [allFetchedStories, setAllFetchedStories] = useState<Story[]>([]);
  const [lastStory, setLastStory] = useState<Story | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const loadMoreStories = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    // The subgenre is passed to getStories but it's not used in the query
    const newStories = await getStories(initialSubgenre, lastStory);
    if (newStories.length > 0) {
      setAllFetchedStories((prev) => [...prev, ...newStories]);
      setLastStory(newStories[newStories.length - 1]);
    }
    if (newStories.length < STORIES_PER_PAGE) {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [hasMore, isLoading, initialSubgenre, lastStory]);
  
  // This useEffect will run only once on mount to fetch initial stories
  useEffect(() => {
    const fetchInitial = async () => {
        setIsLoading(true);
        const initialStories = await getStories('all', null);
        setAllFetchedStories(initialStories);
        setLastStory(initialStories[initialStories.length - 1] || null);
        if (initialStories.length < STORIES_PER_PAGE) {
            setHasMore(false);
        }
        setIsLoading(false);
    };
    fetchInitial();
  }, []);

  const filteredStories = useMemo(() => {
    if (initialSubgenre === 'all') {
      return allFetchedStories;
    }
    return allFetchedStories.filter(story => story.subgenre === initialSubgenre);
  }, [allFetchedStories, initialSubgenre]);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '400px', // Load more when 400px away from the bottom
  });

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
        startTransition(() => {
            loadMoreStories();
        });
    }
  }, [inView, isLoading, hasMore, loadMoreStories]);

  if (allFetchedStories.length === 0 && isLoading) {
    return <StoryListSkeleton />;
  }

  if (filteredStories.length === 0 && !isLoading) {
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
        {initialSubgenre !== 'all' && (
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
        {filteredStories.map((story, index) => (
          <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
        ))}
      </div>

      <div ref={ref} className="flex justify-center items-center col-span-full py-6">
        {isLoading && (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading More...
          </Button>
        )}
        {!hasMore && filteredStories.length > 0 && (
          <p className="text-muted-foreground">You've reached the end!</p>
        )}
      </div>
    </>
  );
}
