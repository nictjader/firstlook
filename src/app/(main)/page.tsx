
import StoryList from '@/components/story/story-list';
import SubgenreFilter from '@/components/story/subgenre-filter';
import { Suspense } from 'react';
import type { Subgenre } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getStories } from '@/lib/actions/storyActions';

// Revalidate the page every 5 minutes to fetch new stories
export const revalidate = 300; 

const StoryListSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[45vw] sm:h-[30vw] md:h-[25vw] lg:h-[20vw] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export default async function HomePage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedSubgenre = (searchParams?.subgenre as Subgenre) || 'all';
  
  // Fetch only the stories needed for the current view
  const stories = await getStories({ subgenre: selectedSubgenre });
  
  return (
    <div className="space-y-6 sm:space-y-8">
       <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-2">
          Discover Your Next Obsession
        </h1>
        <p className="text-muted-foreground">
          Dive into a world of passion and adventure. Your next favorite story awaits.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-10 w-full max-w-md mx-auto" />}>
        <SubgenreFilter />
      </Suspense>
      <Suspense fallback={<StoryListSkeleton />}>
        <StoryList stories={stories} />
      </Suspense>
    </div>
  );
}
