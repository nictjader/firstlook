
'use client';

import { Suspense, useEffect, useState } from 'react';
import StoryList from '../components/story/story-list';
import SubgenreFilter from '../components/story/subgenre-filter';
import type { Subgenre, Story } from '../lib/types';
import { Skeleton } from '../components/ui/skeleton';
import { getStoriesClient } from '../lib/actions/storyActions';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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

function HomePageContent() {
  const searchParams = useSearchParams();
  const selectedSubgenre = (searchParams.get('subgenre') as Subgenre) || 'all';

  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedStories = await getStoriesClient({ subgenre: selectedSubgenre });
        setStories(fetchedStories);
      } catch (e: any) {
        console.error("Critical error fetching stories:", e);
        setError(e.message || "An unknown error occurred while fetching stories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [selectedSubgenre]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-2">
          Get Addicted to Romance Novels Now
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Dive into free previews of heart-pounding love stories. Pay only for the chapters you can’t resist—your next obsession starts with one click.
        </p>
      </div>

      <SubgenreFilter />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Stories</AlertTitle>
          <AlertDescription>
            Could not retrieve stories from the database. This might be a
            connection or a permissions issue. Please ensure your Firebase
            project is configured correctly and the security rules for the
            'stories' collection allow public reads.
            <br />
            <strong className="mt-2 block">Details: {error}</strong>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <StoryListSkeleton />
      ) : (
        <StoryList stories={stories} />
      )}
    </div>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <HomePageContent />
    </Suspense>
  )
}
