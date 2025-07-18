
'use client';

import { useState, useEffect } from 'react';
import type { Story, Subgenre } from '@/lib/types';
import StoryCard from './story-card';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookX, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMoreStoriesAction } from '@/app/actions/storyActions';
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
    triggerOnce: false, // Keep observing
  });

  // Reset stories when the subgenre filter changes
  useEffect(() => {
    setStories(initialStories);
    setHasMore(initialStories.length === STORIES_PER_PAGE);
  }, [initialStories, selectedSubgenre]);

  const loadMoreStories = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const cursor = stories[stories.length - 1]?.storyId;
    if (!cursor) {
      setIsLoading(false);
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
      console.error("Failed to load more stories:", error);
      // Optionally show a toast or error message to the user
    } finally {
      setIsLoading(false);
    }
  };
  
  // When the loader element comes into view, load more stories
  useEffect(() => {
    if (inView) {
      loadMoreStories();
    }
  }, [inView]);


  if (initialStories.length === 0) {
    return (
      <Card className="text-center col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 mt-8 shadow-none border-dashed">
        <CardHeader>
          <div className="mx-auto bg-secondary rounded-full p-3 w-fit">
            <BookX className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>No Stories Found</CardTitle>
          <CardDescription>
            It looks like there are no stories in this category yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please check back later or try a different subgenre.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
           <Link href="/admin">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Generate New Stories
                </button>
            </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-cols-4 gap-4 sm:gap-6">
        {stories.map((story, index) => (
          <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
        ))}
      </div>
      
      {hasMore && (
        <div ref={ref} className="flex justify-center items-center col-span-full py-6">
          {isLoading ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading More...
            </Button>
          ) : (
            // This is the trigger element, it can be an invisible div or a button
            // An invisible div is better for infinite scroll UX
            <div className="h-10"></div> 
          )}
        </div>
      )}
    </>
  );
}
