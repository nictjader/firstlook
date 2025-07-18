
import StoryList from '@/components/story/story-list';
import SubgenreFilter from '@/components/story/subgenre-filter';
import { Suspense } from 'react';
import type { Subgenre, Story } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';

// Revalidate the page every 5 minutes to fetch new stories
export const revalidate = 300; 

async function getInitialStories(): Promise<Story[]> {
  try {
    console.log("[DEBUG] Starting getInitialStories function");
    
    const db = getAdminDb();
    console.log("[DEBUG] Got admin db instance");
    
    // First, let's check if we have ANY stories at all
    const allStoriesQuery = db.collection('stories').limit(5);
    const allSnapshot = await allStoriesQuery.get();
    console.log("[DEBUG] Total stories in collection:", allSnapshot.size);
    
    if (!allSnapshot.empty) {
      allSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`[DEBUG] Story ${index + 1}:`, {
          id: doc.id,
          status: data.status,
          title: data.title,
          publishedAt: data.publishedAt,
          publishedAtType: typeof data.publishedAt,
        });
      });
    }
    
    // Now check published stories specifically
    const storiesQuery = db
      .collection('stories')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(12);
      
    console.log("[DEBUG] Executing published stories query");
    const snapshot = await storiesQuery.get();
    console.log("[DEBUG] Published stories query returned:", snapshot.size, "documents");

    if (snapshot.empty) {
      console.log("[DEBUG] No published stories found");
      return [];
    }

    const stories = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      console.log(`[DEBUG] Processing story ${index + 1}:`, {
        id: doc.id,
        title: data.title,
        publishedAt: data.publishedAt,
        publishedAtType: typeof data.publishedAt,
        hasToDateMethod: data.publishedAt && typeof data.publishedAt.toDate === 'function'
      });
      
      // More defensive timestamp handling
      let publishedAtString: string;
      if (data.publishedAt) {
        try {
          if (typeof data.publishedAt.toDate === 'function') {
            publishedAtString = data.publishedAt.toDate().toISOString();
          } else if (data.publishedAt instanceof Date) {
            publishedAtString = data.publishedAt.toISOString();
          } else if (typeof data.publishedAt === 'string') {
            publishedAtString = data.publishedAt;
          } else {
            console.warn(`[DEBUG] Unexpected publishedAt type for story ${doc.id}:`, typeof data.publishedAt);
            publishedAtString = new Date().toISOString();
          }
        } catch (timestampError) {
          console.error(`[DEBUG] Error processing publishedAt for story ${doc.id}:`, timestampError);
          publishedAtString = new Date().toISOString();
        }
      } else {
        publishedAtString = new Date().toISOString();
      }
      
      const story: Story = {
        storyId: doc.id,
        title: data.title || 'Untitled',
        isPremium: Boolean(data.isPremium),
        coinCost: Number(data.coinCost) || 0,
        previewText: data.previewText || '',
        subgenre: data.subgenre || 'contemporary',
        publishedAt: publishedAtString,
        coverImageUrl: data.coverImageUrl || '',
        seriesId: data.seriesId || null,
        seriesTitle: data.seriesTitle || null,
        partNumber: data.partNumber || null,
        totalPartsInSeries: data.totalPartsInSeries || null,
        characterNames: Array.isArray(data.characterNames) ? data.characterNames : [],
        content: data.content || '',
        wordCount: Number(data.wordCount) || 0,
        coverImagePrompt: data.coverImagePrompt || '',
        author: data.author || 'Anonymous',
        tags: Array.isArray(data.tags) ? data.tags : [],
        status: data.status || 'published',
      };
      
      console.log(`[DEBUG] Created story object ${index + 1}:`, {
        storyId: story.storyId,
        title: story.title,
        publishedAt: story.publishedAt,
        status: story.status
      });
      
      return story;
    });

    console.log("[DEBUG] Final stories array length:", stories.length);
    return stories;
  } catch (error) {
    console.error("[DEBUG] Error in getInitialStories:", error);
    console.error("[DEBUG] Error stack:", error instanceof Error ? error.stack : 'No stack available');
    
    // Return empty array but don't throw - let the component handle it
    return [];
  }
}

export default async function HomePage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  console.log("[DEBUG] HomePage component starting");
  console.log("[DEBUG] searchParams:", searchParams);
  
  const selectedSubgenre = (searchParams?.subgenre as Subgenre) || 'all';
  console.log("[DEBUG] selectedSubgenre:", selectedSubgenre);
  
  // Using the new direct query function
  const initialStories = await getInitialStories();
  console.log("[DEBUG] initialStories received in HomePage:", initialStories.length);

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
