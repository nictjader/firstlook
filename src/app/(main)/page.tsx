
import StoryList from '@/components/story/story-list';
import SubgenreFilter from '@/components/story/subgenre-filter';
import { Suspense } from 'react';
import type { Subgenre } from '@/lib/types';

// Revalidate the page every 5 minutes to fetch new stories
export const revalidate = 300; 

export default function HomePage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedSubgenre = (searchParams?.subgenre as Subgenre) || 'all';
  
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
      <StoryList initialSubgenre={selectedSubgenre} />
    </div>
  );
}
