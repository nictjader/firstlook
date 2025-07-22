
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';


/**
 * Fetches all stories from the database, sorted logically with series grouped together.
 * This is used for the main story list page.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    
    // Use the new composite index to sort stories correctly.
    // Series will be grouped together by seriesId (primary key), and parts will be in order (secondary key).
    // Standalone stories will be sorted by their own storyId.
    const q = storiesRef
      .orderBy('primarySortKey', 'desc')
      .orderBy('secondarySortKey', 'asc')
      .limit(200);

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

/**
 * Fetches a single story by its ID.
 * @param storyId The ID of the story to fetch.
 * @returns The story object or null if not found.
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
    try {
        const db = getAdminDb();
        const storyDocRef = db.collection('stories').doc(storyId);
        const storyDoc = await storyDocRef.get();

        if (!storyDoc.exists) {
            return null;
        }

        return docToStory(storyDoc as QueryDocumentSnapshot);
    } catch (error) {
        console.error(`Error fetching story by ID ${storyId}:`, error);
        return null;
    }
}

/**
 * Fetches all parts of a series.
 * @param seriesId The ID of the series to fetch parts for.
 * @returns An array of story objects belonging to the series.
 */
export async function getSeriesParts(seriesId: string): Promise<Story[]> {
    if (!seriesId) return [];
    try {
        const db = getAdminDb();
        const storiesRef = db.collection('stories');
        const q = storiesRef.where('seriesId', '==', seriesId).orderBy('partNumber', 'asc');
        const querySnapshot = await q.get();
        return querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    } catch (error) {
        console.error(`Error fetching series parts for seriesId ${seriesId}:`, error);
        return [];
    }
}
