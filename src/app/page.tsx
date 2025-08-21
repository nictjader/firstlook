
import StoryList from '@/components/story/story-list';
import SubgenreFilter from '@/components/story/subgenre-filter';
import { Suspense } from 'react';
import type { Subgenre, Story } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getStories } from '@/lib/actions/storyActions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Revalidate the page every 5 minutes to fetch new stories
export const revalidate = 300;

// Force dynamic rendering because SubgenreFilter uses useSearchParams
export const dynamic = 'force-dynamic';

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
  
  let stories: Story[] = [];
  let error: string | null = null;

  try {
    // Fetch only the stories needed for the current view
    stories = await getStories({ subgenre: selectedSubgenre });
  } catch (e: any) {
    console.error("Critical error fetching stories for homepage:", e);
    error = e.message || "An unknown error occurred while fetching stories.";
  }

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

      <SubgenreFilter />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Stories</AlertTitle>
          <AlertDescription>
            Could not retrieve stories from the database. This might be a connection or a permissions issue.
            Please ensure your Firebase project is configured correctly and the security rules for the 'stories' collection allow public reads.
            <br />
            <strong className="mt-2 block">Details: {error}</strong>
          </AlertDescription>
        </Alert>
      )}

      {!error && stories.length === 0 && (
         <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Stories Found</AlertTitle>
          <AlertDescription>
            The database connection was successful, but no stories were found in the 'stories' collection for the selected filter. Please check your Firestore database to ensure it contains story documents.
          </AlertDescription>
        </Alert>
      )}

      <Suspense fallback={<StoryListSkeleton />}>
        <StoryList stories={stories} />
      </Suspense>
    </div>
  );
}
