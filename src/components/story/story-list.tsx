
'use client';

import { useState, useEffect } from 'react';
import type { Story, Subgenre } from '@/lib/types';
import StoryCard from './story-card';
import Link from 'next/link';
import { BookX, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMoreStoriesWithGroupingAction } from '@/app/actions/userActions';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const STORIES_PER_PAGE = 12;

interface StoryListProps {
  initialStories: Story[];
  selectedSubgenre: Subgenre | 'all';
}

export default function StoryList({ initialStories, selectedSubgenre }: StoryListProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialStories.length === STORIES_PER_PAGE);
  const [currentOffset, setCurrentOffset] = useState(initialStories.length);
  const router = useRouter();
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    setStories(initialStories);
    setHasMore(initialStories.length === STORIES_PER_PAGE);
    setCurrentOffset(initialStories.length);
  }, [initialStories]);

  const loadMoreStories = async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);

    try {
      const newStories = await getMoreStoriesWithGroupingAction(selectedSubgenre, currentOffset);
      if (newStories.length > 0) {
        setStories(prev => [...prev, ...newStories]);
        setCurrentOffset(prev => prev + newStories.length);
        setHasMore(newStories.length === STORIES_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[StoryList] Failed to load more stories:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (inView) {
      loadMoreStories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (stories.length === 0 && !isLoading) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-span-4 gap-4 sm:gap-6">
        {stories.map((story, index) => (
          <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
        ))}
      </div>
      
      <div ref={ref} className="flex justify-center items-center col-span-full py-6">
        {isLoading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading More...
          </Button>
        ) : !hasMore && stories.length > 0 ? (
          <p className="text-muted-foreground">You've reached the end!</p>
        ) : (
          <div className="h-10"></div>
        )}
      </div>
    </>
  );
}
