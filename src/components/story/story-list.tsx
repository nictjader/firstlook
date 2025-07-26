
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

// Hardcoded data for diagnostics
const hardcodedStories: Story[] = [
    {
        storyId: 'test-1',
        title: 'Test Story One: A Hardcoded Tale',
        subgenre: 'contemporary',
        isPremium: false,
        coinCost: 0,
        publishedAt: new Date().toISOString(),
        coverImageUrl: 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Test+1',
        previewText: 'This is a test story to see if components render.',
        content: '<p>This is a test.</p>',
        wordCount: 5,
        coverImagePrompt: 'A test image',
        author: 'The Prototyper',
        status: 'published',
    },
    {
        storyId: 'test-2',
        title: 'Test Story Two: Another Test',
        subgenre: 'historical',
        isPremium: true,
        coinCost: 50,
        publishedAt: new Date().toISOString(),
        coverImageUrl: 'https://placehold.co/600x900/333/fff.png?text=Test+2',
        previewText: 'This is a second test story.',
        content: '<p>This is another test.</p>',
        wordCount: 5,
        coverImagePrompt: 'Another test image',
        author: 'The Prototyper',
        status: 'published',
    }
];


export default function StoryList({ selectedSubgenre }: StoryListProps) {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Using hardcoded data instead of fetching
    setAllStories(hardcodedStories);
    setIsLoading(false);
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
