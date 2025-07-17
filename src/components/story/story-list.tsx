
'use client';

import type { Story } from '@/lib/types';
import StoryCard from './story-card';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookX, PlusCircle } from 'lucide-react';

interface StoryListProps {
  stories: Story[];
}

export default function StoryList({ stories }: StoryListProps) {
  if (!stories || stories.length === 0) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-cols-4 gap-4 sm:gap-6">
      {stories.map((story, index) => (
        <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
      ))}
    </div>
  );
}
