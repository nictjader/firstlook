
'use server';

import { getAdminDb, adminAppPromise } from '@/lib/firebase/admin';
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
  await adminAppPromise; // Ensure Firebase Admin is initialized
  const { subgenre = 'all' } = options;

  try {
    const db = getAdminDb();
    let storiesQuery: Query = db.collection('stories');

    // Always order by published date to get the newest stories first
    // This is a simple query that doesn't require a composite index.
    storiesQuery = storiesQuery.orderBy('publishedAt', 'desc');

    const snapshot = await storiesQuery.get();

    if (snapshot.empty) {
      // This is not an error, just an empty result.
      return [];
    }
    
    let stories = snapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));

    // Perform filtering in code after fetching, which avoids the composite index requirement.
    if (subgenre !== 'all') {
      stories = stories.filter(story => story.subgenre === subgenre);
    }

    return stories;

  } catch (error) {
    console.error(`CRITICAL: Firestore query failed in getStories for subgenre "${subgenre}". This might indicate a permissions issue if it persists.`, error);
    // Re-throw the error to be caught by the calling page component
    throw new Error('Failed to fetch stories from the database.');
  }
}


/**
 * Fetches a single story by its ID using a direct document lookup.
 * @param storyId The ID of the story to fetch.
 * @returns The story object or null if not found.
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
    await adminAppPromise; // Ensure Firebase Admin is initialized
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
    await adminAppPromise; // Ensure Firebase Admin is initialized
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
