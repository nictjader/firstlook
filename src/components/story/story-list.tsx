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
 * Groups stories by series. For any series, it only returns Chapter 1.
 * Standalone stories are returned as-is.
 * The final list is sorted by publication date, with newest stories/series first.
 * @param stories The raw array of stories.
 * @returns A sorted array of stories with series represented only by their first chapter.
 */
function groupAndSortStories(stories: Story[]): Story[] {
  const storyMap = new Map<string, Story>();

  // First pass: process all stories and prioritize Chapter 1 for series.
  for (const story of stories) {
    if (story.seriesId) {
      // This is a series.
      const existing = storyMap.get(story.seriesId);
      if (!existing || (story.partNumber === 1 && existing.partNumber !== 1)) {
        // If it's the first time we see this series, or if the current story is Part 1,
        // we make it the representative story for the series.
        storyMap.set(story.seriesId, story);
      }
    } else {
      // This is a standalone story.
      storyMap.set(story.storyId, story);
    }
  }

  const finalStories = Array.from(storyMap.values());
  
  // Sort the final list by publication date to ensure newest appear first
  finalStories.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return finalStories;
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
        const groupedAndSorted = groupAndSortStories(fetchedStories);
        setAllStories(groupedAndSorted);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
        setAllStories([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []); 

  const filteredStories = useMemo(() => {
    if (selectedSubgenre === 'all') {
      return allStories;
    }
    return allStories.filter(story => story.subgenre === selectedSubgenre);
  }, [allStories, selectedSubgenre]);

  if (isLoading) {
    return <StoryListSkeleton />;
  }

  if (filteredStories.length === 0) {
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
      {filteredStories.map((story, index) => (
        <StoryCard key={story.storyId} story={story} isPriority={index < 8} />
      ))}
    </div>
  );
}
