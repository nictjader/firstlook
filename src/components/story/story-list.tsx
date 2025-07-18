
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

function groupAndSortStories(stories: Story[]): Story[] {
  const storyMap = new Map<string, Story[]>();
  const standaloneStories: Story[] = [];

  // Separate standalone stories and group series parts
  stories.forEach(story => {
    if (story.seriesId) {
      if (!storyMap.has(story.seriesId)) {
        storyMap.set(story.seriesId, []);
      }
      storyMap.get(story.seriesId)!.push(story);
    } else {
      standaloneStories.push(story);
    }
  });

  // Sort each series by part number
  storyMap.forEach(group => {
    group.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
  });

  // Combine standalone stories and sorted series into a single array
  const combined: (Story | Story[])[] = [...standaloneStories, ...Array.from(storyMap.values())];

  // Sort the combined list by the publication date of the story or the first part of the series
  combined.sort((a, b) => {
    const dateA = new Date(Array.isArray(a) ? a[0].publishedAt : a.publishedAt).getTime();
    const dateB = new Date(Array.isArray(b) ? b[0].publishedAt : b.publishedAt).getTime();
    return dateB - dateA; // Sort descending (newest first)
  });
  
  // Flatten the array
  return combined.flat();
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

  const filteredAndSortedStories = useMemo(() => {
    if (selectedSubgenre === 'all') {
      return groupAndSortStories(allStories);
    }

    // Find all series IDs that have at least one part matching the subgenre
    const matchingSeriesIds = new Set<string>();
    allStories.forEach(story => {
      if (story.seriesId && story.subgenre === selectedSubgenre) {
        matchingSeriesIds.add(story.seriesId);
      }
    });

    // Filter stories: include all parts of matching series, and standalone stories that match
    const filtered = allStories.filter(story => {
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
    
    return groupAndSortStories(filtered);
  }, [allStories, selectedSubgenre]);

  if (isLoading) {
    return <StoryListSkeleton />;
  }

  if (filteredAndSortedStories.length === 0) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {filteredAndSortedStories.map((story, index) => (
        <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
      ))}
    </div>
  );
}
