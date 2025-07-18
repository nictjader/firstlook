'use server';

import type { Story, Subgenre } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper to safely convert Firestore Timestamps or date strings to a serializable string
function safeToISOString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Timestamp || (timestamp && typeof timestamp.toDate === 'function')) {
        return timestamp.toDate().toISOString();
    }
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    console.warn('Could not parse date value:', timestamp);
    return new Date().toISOString(); // Default to current date as a fallback
}

// Helper to safely convert Firestore DocumentSnapshot to a Story object
function docToStory(doc: FirebaseFirestore.DocumentSnapshot): Story | null {
  try {
    const data = doc.data();
    if (!data) {
      console.warn(`No data found for document with ID ${doc.id}`);
      return null;
    }
    
    const publishedAt = data.publishedAt;
    
    // Add debugging for problematic fields
    console.log(`Converting document ${doc.id} to Story:`, {
      title: data.title,
      seriesId: data.seriesId,
      seriesTitle: data.seriesTitle,
      partNumber: data.partNumber,
      totalPartsInSeries: data.totalPartsInSeries,
      hasSeriesId: data.hasOwnProperty('seriesId'),
      hasSeriesTitle: data.hasOwnProperty('seriesTitle'),
      hasPartNumber: data.hasOwnProperty('partNumber'),
      hasTotalParts: data.hasOwnProperty('totalPartsInSeries')
    });
    
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
      publishedAt: safeToISOString(publishedAt), // Convert to ISO string here
      coverImageUrl: data.coverImageUrl || '',
      coverImagePrompt: data.coverImagePrompt || '',
      author: data.author || 'Anonymous',
      tags: data.tags || [],
      status: data.status || 'published',
    };
  } catch (error) {
    console.error(`Error converting document ${doc.id} to Story:`, error);
    console.error('Document data:', doc.data());
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
  console.log('getStories called with:', { filter, pagination });
  
  const db = getAdminDb();
  let storiesQuery: FirebaseFirestore.Query = db.collection('stories');

  // Apply required filters first
  storiesQuery = storiesQuery.where('status', '==', 'published');
  console.log('Applied status filter: published');
  
  if (filter.subgenre && filter.subgenre !== 'all') {
    storiesQuery = storiesQuery.where('subgenre', '==', filter.subgenre);
    console.log('Applied subgenre filter:', filter.subgenre);
  }
  
  // ALWAYS order by a consistent field for pagination to work reliably.
  storiesQuery = storiesQuery.orderBy('publishedAt', 'desc');
  console.log('Applied ordering: publishedAt desc');

  // Handle pagination using a cursor
  if (pagination.cursor) {
    try {
        const cursorDoc = await db.collection('stories').doc(pagination.cursor).get();
        if (cursorDoc.exists) {
            storiesQuery = storiesQuery.startAfter(cursorDoc);
            console.log('Applied cursor pagination after:', pagination.cursor);
        } else {
            console.warn(`Cursor document with ID ${pagination.cursor} not found.`);
        }
    } catch(e) {
        console.error(`Error fetching cursor document:`, e);
    }
  }

  // Apply limit
  const limit = pagination.limit || 12;
  storiesQuery = storiesQuery.limit(limit);
  console.log('Applied limit:', limit);

  try {
    console.log('Executing Firestore query...');
    const querySnapshot = await storiesQuery.get();
    console.log('Query completed. Documents found:', querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log('No documents found in query');
      return [];
    }
    
    // Log first few documents for debugging
    querySnapshot.docs.slice(0, 2).forEach((doc, index) => {
      console.log(`Document ${index + 1} (${doc.id}):`, doc.data());
    });
    
    const stories = querySnapshot.docs
      .map(docToStory)
      .filter((story): story is Story => story !== null); 
    
    console.log(`Successfully converted ${stories.length} documents to stories`);
    return stories;

  } catch (error) {
    console.error('[getStories] A critical error occurred during query execution:', error);
    // Log the full error for debugging
    console.error('Full error details:', JSON.stringify(error, null, 2));
    // This is often due to a missing Firestore index. The error message in the
    // Firebase console will contain a link to create the required index automatically.
    return []; // Return an empty array on error
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
