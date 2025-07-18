
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Story, Subgenre } from '@/lib/types';
import StoryCard from './story-card';
import { useRouter } from 'next/navigation';
import { BookX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useInView } from 'react-intersection-observer';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

const STORIES_PER_PAGE = 12;

function docToStory(doc: QueryDocumentSnapshot<DocumentData>): Story {
  const data = doc.data();
  return {
    storyId: doc.id,
    title: data.title || 'Untitled',
    characterNames: data.characterNames || [],
    seriesId: data.seriesId || undefined,
    seriesTitle: data.seriesTitle || undefined,
    partNumber: data.partNumber || undefined,
    totalPartsInSeries: data.totalPartsInSeries || undefined,
    isPremium: data.isPremium || false,
    coinCost: data.coinCost || 0,
    content: data.content || '',
    previewText: data.previewText || '',
    subgenre: data.subgenre || 'contemporary',
    wordCount: data.wordCount || 0,
    publishedAt: data.publishedAt?.toDate().toISOString() || new Date().toISOString(),
    coverImageUrl: data.coverImageUrl || '',
    coverImagePrompt: data.coverImagePrompt || '',
    author: data.author || 'Anonymous',
    tags: data.tags || [],
    status: data.status || 'published',
  };
}

// Helper function to group stories by series and sort them
function groupAndSortStories(stories: Story[]): Story[] {
  const standaloneStories: Story[] = [];
  const seriesStoriesMap = new Map<string, Story[]>();

  stories.forEach(story => {
    if (story.seriesId && story.totalPartsInSeries && story.totalPartsInSeries > 1) {
      if (!seriesStoriesMap.has(story.seriesId)) {
        seriesStoriesMap.set(story.seriesId, []);
      }
      seriesStoriesMap.get(story.seriesId)!.push(story);
    } else {
      standaloneStories.push(story);
    }
  });

  const seriesGroups: Story[][] = [];
  for (const storiesInSeries of seriesStoriesMap.values()) {
    if (storiesInSeries.length === storiesInSeries[0].totalPartsInSeries) {
      storiesInSeries.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
      seriesGroups.push(storiesInSeries);
    } else {
      standaloneStories.push(...storiesInSeries);
    }
  }
  
  const allEntries: (Story | Story[])[] = [...standaloneStories, ...seriesGroups];
  
  allEntries.sort((a, b) => {
    const dateA = new Date(Array.isArray(a) ? a[0].publishedAt : a.publishedAt).getTime();
    const dateB = new Date(Array.isArray(b) ? b[0].publishedAt : b.publishedAt).getTime();
    return dateB - dateA;
  });

  return allEntries.flat();
}


interface StoryListProps {
  selectedSubgenre: Subgenre | 'all';
}

const StoryListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-span-4 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
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


export default function StoryList({ selectedSubgenre }: StoryListProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [allFetchedStories, setAllFetchedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const router = useRouter();
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const loadStories = useCallback(async (initialLoad = false) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let q: Query;
      const storiesRef = collection(db, 'stories');
      const baseQuery = query(
        storiesRef,
        where('status', '==', 'published'),
        ...(selectedSubgenre !== 'all' ? [where('subgenre', '==', selectedSubgenre)] : []),
        orderBy('publishedAt', 'desc'),
        limit(STORIES_PER_PAGE)
      );

      if (initialLoad) {
        q = baseQuery;
      } else if (lastVisible) {
        q = query(baseQuery, startAfter(lastVisible));
      } else {
        // No more stories to load
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const documentSnapshots = await getDocs(q);

      const newStories = documentSnapshots.docs.map(docToStory);
      const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;

      setHasMore(newStories.length === STORIES_PER_PAGE);
      setLastVisible(newLastVisible);
      
      const combinedStories = initialLoad ? newStories : [...allFetchedStories, ...newStories];
      setAllFetchedStories(combinedStories);

      // This is the key: always group and sort the *entire* collection of fetched stories
      const grouped = groupAndSortStories(combinedStories);
      setStories(grouped);

    } catch (error) {
      console.error("[StoryList] Failed to load stories:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedSubgenre, lastVisible, allFetchedStories]);
  
  useEffect(() => {
    // Reset and load fresh on subgenre change
    setStories([]);
    setAllFetchedStories([]);
    setLastVisible(null);
    setHasMore(true);
    loadStories(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubgenre]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadStories();
    }
  }, [inView, isLoading, hasMore, loadStories]);

  if (stories.length === 0 && isLoading) {
    return <StoryListSkeleton />;
  }

  if (stories.length === 0 && !isLoading) {
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-span-4 gap-4 sm:gap-6">
        {stories.map((story, index) => (
          <StoryCard key={story.storyId} story={story} isPriority={index < 4} />
        ))}
      </div>
      
      <div ref={ref} className="flex justify-center items-center col-span-full py-6">
        {isLoading && (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading More...
          </Button>
        )}
        {!hasMore && stories.length > 0 && (
          <p className="text-muted-foreground">You've reached the end!</p>
        )}
      </div>
    </>
  );
}
