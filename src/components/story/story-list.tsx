
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Story, Subgenre } from '@/lib/types';
import StoryCard from './story-card';
import { useRouter } from 'next/navigation';
import { BookX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getAllStories } from '@/app/actions/storyActions';
import { Skeleton } from '@/components/ui/skeleton';

interface StoryListProps {
  selectedSubgenre: Subgenre | 'all';
}

const StoryListSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[45vw] sm:h-[30vw] md:h-[25vw] lg:h-[20vw] w-full rounded-xl" />
            </div>
        ))}
    </div>
);

/**
 * Groups stories to show only the first part of any series on the main list.
 * Standalone stories are passed through untouched.
 * @param stories The raw array of all stories.
 * @returns A filtered array of stories suitable for the homepage.
 */
function groupStoriesForDisplay(stories: Story[]): Story[] {
  const storyMap = new Map<string, Story>();

  // Process all stories to correctly handle series
  for (const story of stories) {
    if (story.seriesId) {
      // It's part of a series
      const existing = storyMap.get(story.seriesId);
      // Only add Part 1, or if Part 1 isn't present yet, add the first part we find.
      if (!existing || (story.partNumber === 1 && existing.partNumber !== 1)) {
        storyMap.set(story.seriesId, story);
      }
    } else {
      // It's a standalone story
      storyMap.set(story.storyId, story);
    }
  }

  // The final list is already sorted by the server action.
  return Array.from(storyMap.values());
}


export default function StoryList({ selectedSubgenre }: StoryListProps) {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const fetchedStories = await getAllStories();
        setAllStories(fetchedStories);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
        setAllStories([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []); 

  const storiesForDisplay = useMemo(() => {
    const grouped = groupStoriesForDisplay(allStories);
    if (selectedSubgenre === 'all') {
      return grouped;
    }
    return grouped.filter(story => story.subgenre === selectedSubgenre);
  }, [allStories, selectedSubgenre]);

  if (isLoading) {
    return <StoryListSkeleton />;
  }

  if (storiesForDisplay.length === 0) {
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {storiesForDisplay.map((story, index) => (
        <StoryCard key={story.storyId} story={story} isPriority={index < 8} />
      ))}
    </div>
  );
}
