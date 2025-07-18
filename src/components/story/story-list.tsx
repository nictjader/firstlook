'use client';

import { useState, useEffect } from 'react';
import type { Story, Subgenre } from '@/lib/types';
import StoryCard from './story-card';
import Link from 'next/link';
import { BookX, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMoreStoriesAction } from '@/app/actions/userActions';
import { useInView } from 'react-intersection-observer';

const STORIES_PER_PAGE = 12;

interface StoryListProps {
  initialStories: Story[];
  selectedSubgenre: Subgenre | 'all';
}

export default function StoryList({ initialStories, selectedSubgenre }: StoryListProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialStories.length === STORIES_PER_PAGE);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    setStories(initialStories);
    setHasMore(initialStories.length === STORIES_PER_PAGE);
  }, [initialStories]);

  const loadMoreStories = async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    const cursor = stories.length > 0 ? stories[stories.length - 1]?.storyId : undefined;
    if (!cursor) {
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    try {
      const newStories = await getMoreStoriesAction(selectedSubgenre, cursor);
      if (newStories.length > 0) {
        setStories(prev => [...prev, ...newStories]);
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
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm text-center col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 mt-8 shadow-none border-dashed">
        <div className="p-6">
          <div className="mx-auto bg-secondary rounded-full p-3 w-fit">
            <BookX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight">No Stories Found</h3>
          <p className="text-sm text-muted-foreground">
            It looks like there are no stories in this category yet.
          </p>
        </div>
        <div className="p-6 pt-0">
          <p className="text-muted-foreground">
            Please check back later or try a different subgenre.
          </p>
        </div>
        <div className="flex items-center p-6 pt-0 justify-center">
           <Link href="/admin">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Generate New Stories
                </button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
