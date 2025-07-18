
'use server';

import type { Story, Subgenre } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper to safely convert Firestore Timestamps or date strings
function safeToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp || (timestamp && typeof timestamp.toDate === 'function')) {
    return timestamp.toDate();
  }
  const date = new Date(timestamp);
  if (!isNaN(date.getTime())) {
    return date;
  }
  return null;
}

// Helper to safely convert Firestore DocumentSnapshot to a Story object
function docToStory(doc: FirebaseFirestore.DocumentSnapshot): Story | null {
  try {
    const data = doc.data();
    if (!data) {
      console.warn(`No data found for document with ID ${doc.id}`);
      return null;
    }
    
    const publishedAtDate = safeToDate(data.publishedAt);

    return {
      storyId: doc.id,
      title: data.title || 'Untitled',
      characterNames: data.characterNames || [],
      seriesId: data.seriesId,
      seriesTitle: data.seriesTitle,
      partNumber: data.partNumber,
      totalPartsInSeries: data.totalPartsInSeries,
      isPremium: data.isPremium || false,
      coinCost: data.coinCost || 0,
      content: data.content || '',
      previewText: data.previewText || '',
      subgenre: data.subgenre || 'contemporary',
      wordCount: data.wordCount || 0,
      publishedAt: publishedAtDate ? publishedAtDate.toISOString() : new Date().toISOString(),
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

// Main function to fetch stories
export async function getStories(
  { filter = {}, pagination = {} }: {
    filter?: { subgenre?: Subgenre | 'all' };
    pagination?: { limit?: number; cursor?: string };
  } = {}
): Promise<Story[]> {
  console.log('[getStories] Starting function with filter:', filter, 'pagination:', pagination);
  const db = getAdminDb();
  let storiesQuery: FirebaseFirestore.Query = db.collection('stories');

  // 1. Basic filter: Only get published stories.
  storiesQuery = storiesQuery.where('status', '==', 'published');

  // 2. Add subgenre filter if it exists and is not 'all'.
  if (filter.subgenre && filter.subgenre !== 'all') {
    storiesQuery = storiesQuery.where('subgenre', '==', filter.subgenre);
    console.log(`[getStories] Applied subgenre filter: ${filter.subgenre}`);
  }
  
  // 3. Always order by publishedAt for consistent pagination.
  storiesQuery = storiesQuery.orderBy('publishedAt', 'desc');

  // 4. Handle pagination using a cursor.
  if (pagination.cursor) {
    const cursorDoc = await db.collection('stories').doc(pagination.cursor).get();
    if (cursorDoc.exists) {
      storiesQuery = storiesQuery.startAfter(cursorDoc);
    }
  }

  // 5. Apply a limit to the number of documents returned.
  if (pagination.limit) {
    storiesQuery = storiesQuery.limit(pagination.limit);
    console.log(`[getStories] Applied limit: ${pagination.limit}`);
  }

  try {
    const querySnapshot = await storiesQuery.get();
    console.log(`[getStories] Query executed. Found ${querySnapshot.docs.length} documents.`);

    if (querySnapshot.empty) {
      console.warn('[getStories] Query returned no documents.');
      return [];
    }

    const stories = querySnapshot.docs
      .map(docToStory)
      .filter((story): story is Story => story !== null); // Filter out any nulls from conversion errors

    console.log(`[getStories] Successfully converted and returning ${stories.length} stories.`);
    return stories;

  } catch (error) {
    console.error('[getStories] A critical error occurred during query execution:', error);
    return []; // Return an empty array on error to prevent crashing the page
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

export async function getStoriesBySeriesId(seriesId: string): Promise<Story[]> {
    if (!seriesId) return [];
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const q = storiesRef.where('seriesId', '==', seriesId).orderBy('partNumber', 'asc');
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
        return [];
    }
    return querySnapshot.docs.map(doc => docToStory(doc)).filter((s): s is Story => !!s);
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

  // Firestore 'in' queries are limited to 30 items in the array
  const MAX_IDS_PER_QUERY = 30; 
  for (let i = 0; i < storyIds.length; i += MAX_IDS_PER_QUERY) {
    const batchIds = storyIds.slice(i, i + MAX_IDS_PER_QUERY);
    const storiesRef = db.collection('stories');
    const q = storiesRef.where('__name__', 'in', batchIds);
    const querySnapshot = await q.get();
    const batchStories = querySnapshot.docs.map(docToStory).filter((s): s is Story => !!s);
    stories.push(...batchStories);
  }
  
  // Re-order the results to match the original storyIds array order
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  const orderedStories = storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);
  
  return orderedStories;
}
