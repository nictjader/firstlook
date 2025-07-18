
'use server';

import type { Story, Subgenre } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';

// Helper to safely convert Firestore DocumentSnapshot to a Story object
function docToStory(doc: FirebaseFirestore.DocumentSnapshot): Story | null {
  try {
    const data = doc.data();
    if (!data) {
      return null;
    }
    
    return {
      storyId: doc.id,
      title: data.title || 'Untitled',
      characterNames: data.characterNames || [],
      seriesId: data.seriesId || null,
      seriesTitle: data.seriesTitle || null,
      partNumber: data.partNumber || null,
      totalPartsInSeries: data.totalPartsInSeries || null,
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
  } catch (error) {
    console.error(`Error converting document ${doc.id} to Story:`, error);
    return null;
  }
}

export async function getStoriesBySeriesId(seriesId: string): Promise<Story[]> {
    if (!seriesId) return [];
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const q = storiesRef.where('seriesId', '==', seriesId).orderBy('partNumber', 'asc');
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
        return [];
    }
    return querySnapshot.docs.map(docToStory).filter((s): s is Story => !!s);
}

// Main function to fetch stories, now with series grouping logic
export async function getStories(
  { filter = {}, pagination = {} }: {
    filter?: { subgenre?: Subgenre | 'all' };
    pagination?: { limit?: number; cursor?: string };
  } = {}
): Promise<Story[]> {
  const db = getAdminDb();
  let storiesQuery: FirebaseFirestore.Query = db.collection('stories');

  // Base filters
  storiesQuery = storiesQuery.where('status', '==', 'published');
  // This is the key change: We only fetch standalone stories or the FIRST part of a series in the main query.
  storiesQuery = storiesQuery.where('partNumber', 'in', [null, 1]);

  if (filter.subgenre && filter.subgenre !== 'all') {
    storiesQuery = storiesQuery.where('subgenre', '==', filter.subgenre);
  }
  
  storiesQuery = storiesQuery.orderBy('publishedAt', 'desc');

  if (pagination.cursor) {
    try {
        const cursorDoc = await db.collection('stories').doc(pagination.cursor).get();
        if (cursorDoc.exists) {
            storiesQuery = storiesQuery.startAfter(cursorDoc);
        }
    } catch(e) {
        console.error(`Error fetching cursor document:`, e);
    }
  }

  const limit = pagination.limit || 12;
  storiesQuery = storiesQuery.limit(limit);

  try {
    const querySnapshot = await storiesQuery.get();
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const mainStories = querySnapshot.docs
      .map(docToStory)
      .filter((story): story is Story => story !== null);

    // Identify series and collect their IDs
    const seriesIdsToFetch = mainStories
      .filter(story => story.seriesId && story.partNumber === 1)
      .map(story => story.seriesId as string);

    if (seriesIdsToFetch.length > 0) {
      // Fetch all parts for the identified series
      const seriesPartsQuery = db.collection('stories')
        .where('seriesId', 'in', seriesIdsToFetch)
        .where('partNumber', '>', 1) // Fetch parts other than the first one
        .orderBy('seriesId')
        .orderBy('partNumber', 'asc');
      
      const seriesPartsSnapshot = await seriesPartsQuery.get();
      const seriesParts = seriesPartsSnapshot.docs
        .map(docToStory)
        .filter((story): story is Story => story !== null);

      // Create a map for easy lookup
      const seriesPartsMap = new Map<string, Story[]>();
      seriesParts.forEach(part => {
        if (part.seriesId) {
          if (!seriesPartsMap.has(part.seriesId)) {
            seriesPartsMap.set(part.seriesId, []);
          }
          seriesPartsMap.get(part.seriesId)!.push(part);
        }
      });

      // Merge the series parts into the main list
      const finalStories: Story[] = [];
      mainStories.forEach(story => {
        finalStories.push(story);
        if (story.seriesId && seriesPartsMap.has(story.seriesId)) {
          finalStories.push(...seriesPartsMap.get(story.seriesId)!);
        }
      });

      return finalStories;
    }
    
    return mainStories;

  } catch (error) {
    console.error('[getStories] A critical error occurred during query execution:', error);
    return [];
  }
}

// Function to get a single story
export async function getStoryById(id: string): Promise<Story | undefined> {
  const db = getAdminDb();
  const storyDocRef = db.collection('stories').doc(id);
  const docSnap = await storyDocRef.get();
  
  if (!docSnap.exists) {
    return undefined;
  }
  const story = docToStory(docSnap);
  return story ?? undefined;
}

export async function getAllStoryTitles(): Promise<Set<string>> {
  const db = getAdminDb();
  const storiesRef = db.collection('stories');
  const querySnapshot = await storiesRef.get();
  const titles = new Set<string>();
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.title) {
      titles.add(data.title.toLowerCase());
    }
  });
  return titles;
}

export async function getStoriesByIds(storyIds: string[]): Promise<Story[]> {
  if (!storyIds || storyIds.length === 0) {
    return [];
  }
  const db = getAdminDb();
  const stories: Story[] = [];

  const MAX_IDS_PER_QUERY = 30; 
  for (let i = 0; i < storyIds.length; i += MAX_IDS_PER_QUERY) {
    const batchIds = storyIds.slice(i, i + MAX_IDS_PER_QUERY);
    const storiesRef = db.collection('stories');
    const q = storiesRef.where('__name__', 'in', batchIds);
    const querySnapshot = await q.get();
    const batchStories = querySnapshot.docs.map(docToStory).filter((s): s is Story => !!s);
    stories.push(...batchStories);
  }
  
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  const orderedStories = storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);
  
  return orderedStories;
}
