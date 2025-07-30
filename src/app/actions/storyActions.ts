
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story, Subgenre } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';

interface GetStoriesOptions {
  subgenre?: Subgenre | 'all';
  limit?: number;
}

/**
 * Fetches stories from the database with optional filters.
 * This is the primary function for fetching story lists.
 * @param options - An object with filtering options like subgenre and limit.
 * @returns A promise that resolves to an array of Story objects.
 */
export async function getStories(options: GetStoriesOptions = {}): Promise<Story[]> {
  const { subgenre = 'all' } = options;

  try {
    const db = getAdminDb();
    let storiesQuery: Query = db.collection('stories');

    // Apply subgenre filter if it's not 'all'
    if (subgenre !== 'all') {
      storiesQuery = storiesQuery.where('subgenre', '==', subgenre);
    }

    // Always order by published date to get the newest stories first
    storiesQuery = storiesQuery.orderBy('publishedAt', 'desc');

    const snapshot = await storiesQuery.get();

    if (snapshot.empty) {
      console.warn(`No stories found for subgenre: ${subgenre}`);
      return [];
    }
    
    return snapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));

  } catch (error) {
    console.error(`Critical error in getStories for subgenre "${subgenre}":`, error);
    // In case of an error, return an empty array to prevent the page from crashing.
    return [];
  }
}


/**
 * Fetches a single story by its ID using a direct document lookup.
 * @param storyId The ID of the story to fetch.
 * @returns The story object or null if not found.
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
    try {
        const db = getAdminDb();
        const storyRef = db.collection('stories').doc(storyId);
        const storyDoc = await storyRef.get();

        if (!storyDoc.exists) {
            console.log(`Story with ID ${storyId} not found.`);
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
 * @returns An array of story objects belonging to the series, sorted by part number.
 */
export async function getSeriesParts(seriesId: string): Promise<Story[]> {
    if (!seriesId) {
        return [];
    }
    
    try {
        const db = getAdminDb();
        const storiesRef = db.collection('stories');
        
        const q = storiesRef.where('seriesId', '==', seriesId);
        const querySnapshot = await q.get();
        
        if (querySnapshot.empty) {
            return [];
        }
        
        const stories = querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
        
        // Sort by partNumber in memory to ensure correct order.
        stories.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
        
        return stories;
        
    } catch (error) {
        console.error(`Error fetching series parts for seriesId ${seriesId}:`, error);
        return [];
    }
}
