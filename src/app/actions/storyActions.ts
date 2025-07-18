
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import {
  Query,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';


/**
 * Fetches all stories from the database, sorted by publication date.
 * Filtering by subgenre will be handled on the client side.
 * This simplifies the query to avoid needing custom Firestore indexes.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    
    // Simple query that doesn't require a composite index.
    const q = storiesRef.orderBy('publishedAt', 'desc');

    const documentSnapshots = await q.get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    
    return stories;
  } catch (error) {
    console.error(`Error fetching all stories:`, error);
    // Return an empty array to prevent the page from crashing.
    return [];
  }
}
