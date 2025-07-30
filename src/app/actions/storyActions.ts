
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Fetches all stories from the database.
 * This simplified version focuses on fetching from the top-level 'stories' collection
 * to ensure the basic database connection is working.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    // Using a simple collection query to start
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();

    if (snapshot.empty) {
      console.log("No stories found in the top-level 'stories' collection.");
      // To ensure we get all data, let's also try a collection group query as a fallback
      const groupSnapshot = await db.collectionGroup('stories').orderBy('publishedAt', 'desc').get();
       if (groupSnapshot.empty) {
         console.log("No stories found in the 'stories' collection group either.");
         return [];
       }
       console.log(`Found ${groupSnapshot.size} stories in the collection group.`);
       return groupSnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    }
    
    console.log(`Found ${snapshot.size} stories in the top-level collection.`);
    return snapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));

  } catch (error) {
    console.error(`Critical error in getAllStories:`, error);
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
 * @returns An array of story objects belonging to the series.
 */
export async function getSeriesParts(seriesId: string): Promise<Story[]> {
    if (!seriesId) {
        return [];
    }
    
    try {
        const db = getAdminDb();
        // A collectionGroup query is appropriate and efficient here because we are using a 'where' filter.
        const storiesRef = db.collectionGroup('stories');
        
        const q = storiesRef.where('seriesId', '==', seriesId);
        const querySnapshot = await q.get();
        
        if (querySnapshot.empty) {
            return [];
        }
        
        const stories = querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
        
        // Sort manually by partNumber in memory
        stories.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
        
        return stories;
        
    } catch (error) {
        console.error(`Error fetching series parts for seriesId ${seriesId}:`, error);
        return [];
    }
}
