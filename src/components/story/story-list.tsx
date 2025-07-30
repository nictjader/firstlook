
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
 * Groups stories to show only the first chapter of any series on the main list.
 * Standalone stories are passed through untouched. This function corrects a previous
 * flaw where multiple parts of a series might be shown.
 * @param stories The raw array of stories (already filtered by genre).
 * @returns A filtered array of stories suitable for the homepage.
 */
function groupStoriesForDisplay(stories: Story[]): Story[] {
    const storyMap = new Map<string, Story>();
    const seriesPartOnes = new Map<string, Story>();

    // First pass: identify all standalone stories and find the definitive Part 1 for each series.
    for (const story of stories) {
        if (story.seriesId) {
            // If this is the first part of a series, store it.
            if (story.partNumber === 1) {
                // If we haven't stored a Part 1 for this series yet, or if this one is newer, update it.
                const existingPartOne = seriesPartOnes.get(story.seriesId);
                if (!existingPartOne || new Date(story.publishedAt) > new Date(existingPartOne.publishedAt)) {
                    seriesPartOnes.set(story.seriesId, story);
                }
            }
        } else {
            // It's a standalone story, so the storyId is the unique key.
            storyMap.set(story.storyId, story);
        }
    }

    // Add the definitive Part 1 of each series to the main map.
    // This overwrites any other parts of the series that might have been added in error.
    for (const partOne of seriesPartOnes.values()) {
        storyMap.set(partOne.seriesId!, partOne);
    }
    
    // Convert map values back to an array.
    const displayStories = Array.from(storyMap.values());

    // Sort the final list by published date to ensure the newest content is first.
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
