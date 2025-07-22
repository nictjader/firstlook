
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';


/**
 * Fetches all stories from the database.
 * The client will be responsible for grouping and sorting.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    
    // Fetch all documents. Sorting will be handled client-side to ensure series are grouped.
    const documentSnapshots = await storiesRef.limit(200).get();
    
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
