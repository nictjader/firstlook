
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story, Subgenre } from '@/lib/types';
import { docToStory } from '@/lib/types';
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

const STORIES_PER_PAGE = 12;

export async function getStories(
  // subgenre is no longer used in the query but kept for potential future use
  subgenre: Subgenre | 'all', 
  lastPublishedAt: string | null
): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');

    // This is the simplest possible query that will work without a custom index.
    // It fetches all stories sorted by date. Filtering will happen on the client.
    const constraints = [
      orderBy('publishedAt', 'desc'),
      limit(STORIES_PER_PAGE),
    ];

    if (lastPublishedAt) {
      // Convert the ISO string back to a Date object for the query
      constraints.push(startAfter(new Date(lastPublishedAt)));
    }
    
    const q: Query<DocumentData> = (storiesRef as any).query(...constraints);

    const documentSnapshots = await q.get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc));
    
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    // In case of an error, return an empty array to prevent crashing the client.
    return [];
  }
}
