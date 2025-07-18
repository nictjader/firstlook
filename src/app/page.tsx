import StoryList from '@/components/story/story-list';
import SubgenreFilter from '@/components/story/subgenre-filter';
import { Suspense } from 'react';
import type { Subgenre, Story } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';

// Revalidate the page every 5 minutes to fetch new stories
export const revalidate = 300; 

async function getInitialStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesQuery = db
      .collection('stories')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(12);
      
    const snapshot = await storiesQuery.get();

    if (snapshot.empty) {
      console.log("Direct query returned no documents.");
      return [];
    }

    const stories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        storyId: doc.id,
        title: data.title || 'Untitled',
        isPremium: data.isPremium || false,
        coinCost: data.coinCost || 0,
        previewText: data.previewText || '',
        subgenre: data.subgenre || 'contemporary',
        publishedAt: data.publishedAt?.toDate().toISOString() || new Date().toISOString(),
        coverImageUrl: data.coverImageUrl || '',
        seriesId: data.seriesId || null,
        seriesTitle: data.seriesTitle || null,
        partNumber: data.partNumber || null,
        totalPartsInSeries: data.totalPartsInSeries || null,
        // Add other required fields with defaults
        characterNames: data.characterNames || [],
        content: data.content || '',
        wordCount: data.wordCount || 0,
        coverImagePrompt: data.coverImagePrompt || '',
        author: data.author || 'Anonymous',
        tags: data.tags || [],
        status: data.status || 'published',
      } as Story;
    });

    return stories;
  } catch (error) {
    console.error("[HomePage Direct Query] Failed to fetch stories:", error);
    return [];
  }
}

export default async function HomePage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedSubgenre = (searchParams?.subgenre as Subgenre) || 'all';
  
  // Using the new direct query function
  const initialStories = await getInitialStories();

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
