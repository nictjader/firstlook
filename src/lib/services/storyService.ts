
'use server';

import type { Story, Subgenre } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper to safely convert Firestore Timestamps
function docToStory(doc: FirebaseFirestore.DocumentSnapshot): Story {
  const data = doc.data();
  if (!data) {
    throw new Error(`No data found for document with ID ${doc.id}`);
  }

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
    publishedAt: data.publishedAt, // Pass raw timestamp data
    coverImageUrl: data.coverImageUrl || '',
    coverImagePrompt: data.coverImagePrompt || '',
    author: data.author || 'Anonymous',
    tags: data.tags || [],
    status: data.status || 'published',
  };
}

// Main function to fetch stories
export async function getStories(
  { filter = {}, pagination = {} }: {
    filter?: { subgenre?: Subgenre | 'all' };
    pagination?: { limit?: number; cursor?: string };
  } = {}
): Promise<Story[]> {
  const db = getAdminDb();
  let storiesQuery: FirebaseFirestore.Query = db.collection('stories');

  // 1. Basic filter: Only get published stories.
  storiesQuery = storiesQuery.where('status', '==', 'published');

  // 2. Add subgenre filter if it exists and is not 'all'.
  if (filter.subgenre && filter.subgenre !== 'all') {
    storiesQuery = storiesQuery.where('subgenre', '==', filter.subgenre);
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
  }

  const querySnapshot = await storiesQuery.get();
  return querySnapshot.docs.map(docToStory);
}

// Function to get a single story
export async function getStoryById(id: string): Promise<Story | undefined> {
  const db = getAdminDb();
  const storyDocRef = db.collection('stories').doc(id);
  const docSnap = await storyDocRef.get();
  
  if (!docSnap.exists) {
    return undefined;
  }

  return docToStory(docSnap);
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
    return querySnapshot.docs.map(docToStory);
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
    const batchStories = querySnapshot.docs.map(docToStory);
    stories.push(...batchStories);
  }
  
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  const orderedStories = storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);
  
  return orderedStories;
}
