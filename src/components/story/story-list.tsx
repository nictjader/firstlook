

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
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

/**
 * Groups stories by series and sorts them.
 * Series are grouped together, and parts within a series are sorted by partNumber.
 * Standalone stories are sorted by publication date.
 * The entire list is sorted so that newest series/stories appear first.
 * @param stories The raw array of stories.
 * @returns A sorted array of stories with series grouped together.
 */
function groupAndSortStories(stories: Story[]): Story[] {
  const seriesMap = new Map<string, Story[]>();
  const standalone: Story[] = [];

  // Separate stories into series or standalone
  stories.forEach(story => {
    if (story.seriesId) {
      if (!seriesMap.has(story.seriesId)) {
        seriesMap.set(story.seriesId, []);
      }
      seriesMap.get(story.seriesId)!.push(story);
    } else {
      standalone.push(story);
    }
  });

  // Sort parts within each series
  seriesMap.forEach(parts => {
    parts.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
  });

  // Get the sorted series as an array of arrays
  const sortedSeries = Array.from(seriesMap.values())
    .sort((a, b) => {
      const dateA = new Date(a[0].publishedAt).getTime();
      const dateB = new Date(b[0].publishedAt).getTime();
      return dateB - dateA; // Newest series first
    });

  // Sort standalone stories
  standalone.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Combine sorted series and standalone stories
  const groupedStories = sortedSeries.flat();
  const finalStories = [...groupedStories, ...standalone];

  // A final sort to ensure the groups are interleaved correctly by date
  // We can do this by finding the "representative" date for each item
  // For a series, it's the date of its first part. For standalone, it's its own date.
  const storyToDateMap = new Map<string, number>();
  stories.forEach(s => {
      if(s.seriesId && s.partNumber === 1) {
          storyToDateMap.set(s.seriesId, new Date(s.publishedAt).getTime());
      }
  });

  finalStories.sort((a, b) => {
      const dateA = a.seriesId ? (storyToDateMap.get(a.seriesId) || 0) : new Date(a.publishedAt).getTime();
      const dateB = b.seriesId ? (storyToDateMap.get(b.seriesId) || 0) : new Date(b.publishedAt).getTime();
      return dateB - dateA;
  })
  
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

    // Find all series IDs that have at least one part matching the subgenre
    const matchingSeriesIds = new Set<string>();
    allStories.forEach(story => {
      if (story.seriesId && story.subgenre === selectedSubgenre) {
        matchingSeriesIds.add(story.seriesId);
      }
    });

    // Filter stories: include all parts of matching series, and standalone stories that match
    return allStories.filter(story => {
      // Include if it's part of a matched series
      if (story.seriesId && matchingSeriesIds.has(story.seriesId)) {
        return true;
      }
      // Include if it's a standalone story that matches the subgenre
      if (!story.seriesId && story.subgenre === selectedSubgenre) {
        return true;
      }
      return false;
    });
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
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {filteredStories.map((story, index) => (
        <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
      ))}
    </div>
  );
}
