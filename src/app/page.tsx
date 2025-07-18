import { getStories } from '@/lib/services/storyService';
import StoryList from '@/components/story/story-list';
import SubgenreFilter from '@/components/story/subgenre-filter';
import { Suspense } from 'react';
import type { Subgenre, Story } from '@/lib/types';

const STORIES_PER_PAGE = 12;

// Revalidate the page every 5 minutes to fetch new stories
export const revalidate = 300; 

export default async function HomePage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedSubgenre = (searchParams?.subgenre as Subgenre) || 'all';
  
  let initialStories: Story[] = [];
  try {
    initialStories = await getStories(
      { subgenre: selectedSubgenre },
      { limit: STORIES_PER_PAGE }
    );
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    // In case of an error (like PERMISSION_DENIED),
    // we'll proceed with an empty array. The StoryList component
    // will then render a helpful message.
  }

  return (
    <div className="space-y-6 sm:space-y-8">
       <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-2">
          Discover Your Next Obsession
        </h1>
        <p className="text-muted-foreground">
          Explore our growing library of AI-generated romance stories.
        </p>
      </div>
      <Suspense fallback={<div>Loading filter...</div>}>
        <SubgenreFilter />
      </Suspense>
        <StoryList initialStories={initialStories} selectedSubgenre={selectedSubgenre} />
    </div>
  );
}
