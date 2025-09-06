
'use client';

import { useMemo } from 'react';
import type { Story } from '../../lib/types';
import StoryCard from './story-card';
import { useRouter } from 'next/navigation';
import { BookX } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface StoryListProps {
  stories: Story[];
}

/**
 * Groups stories to show only the first chapter of any series on the main list.
 * Standalone stories are passed through untouched. This prevents multiple chapters
 * of the same series from cluttering the homepage.
 * @param stories The raw array of stories (already filtered by genre).
 * @returns A filtered array of stories suitable for the homepage.
 */
function groupStoriesForDisplay(stories: Story[]): Story[] {
  const storyMap = new Map<string, Story>();

  // Process all stories, giving preference to Part 1 of any series.
  for (const story of stories) {
    if (story.seriesId) {
      // This story is part of a series.
      const seriesId = story.seriesId;
      const existingEntry = storyMap.get(seriesId);

      // We only want to show Part 1. If we find it, we make it the definitive entry for this series.
      if (story.partNumber === 1) {
        // If the current entry for this series is not Part 1, or if this Part 1 is newer, replace it.
        if (!existingEntry || existingEntry.partNumber !== 1 || new Date(story.publishedAt) > new Date(existingEntry.publishedAt)) {
           storyMap.set(seriesId, story);
        }
      } else {
        // This is a chapter other than Part 1. We only add it if we haven't found Part 1 yet.
        if (!existingEntry) {
          storyMap.set(seriesId, story);
        }
      }
    } else {
      // This is a standalone story.
      storyMap.set(story.storyId, story);
    }
  }

  const displayStories = Array.from(storyMap.values());
  
  // Sort the final, unique list by published date to ensure the newest content is first.
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
