
'use client';

import { useMemo } from 'react';
import type { Story } from '@/lib/types';
import StoryCard from './story-card';
import { useRouter } from 'next/navigation';
import { BookX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface StoryListProps {
  stories: Story[];
}

/**
 * Groups stories to show only the first part of any series on the main list.
 * Standalone stories are passed through untouched.
 * @param stories The raw array of stories (already filtered by genre).
 * @returns A filtered array of stories suitable for the homepage.
 */
function groupStoriesForDisplay(stories: Story[]): Story[] {
  const storyMap = new Map<string, Story>();

  // The incoming stories are already sorted by publishedAt descending
  for (const story of stories) {
    if (story.seriesId) {
      // If we haven't seen this series yet, find its first part and add it.
      if (!storyMap.has(story.seriesId)) {
        const partOne = stories.find(s => s.seriesId === story.seriesId && s.partNumber === 1);
        if (partOne) {
           storyMap.set(story.seriesId, partOne);
        }
      }
    } else {
      // It's a standalone story, so the storyId is the unique key
      storyMap.set(story.storyId, story);
    }
  }
  
  // Convert map values back to an array. The insertion order is preserved.
  const displayStories = Array.from(storyMap.values());

  // We need to re-sort because we might have picked an older Part 1 for a newer series.
  displayStories.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return displayStories;
}

export default function StoryList({ stories }: StoryListProps) {
  const router = useRouter();

  const storiesForDisplay = useMemo(() => groupStoriesForDisplay(stories), [stories]);

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
        <Button variant="outline" onClick={() => router.push('/')}>
            Clear Filter
        </Button>
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
