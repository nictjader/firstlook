
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Fetches all stories from the database for the main story list.
 * This version uses a more robust two-step query to handle nested collections
 * without relying on collectionGroup, which was causing issues.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const allStories: Story[] = [];

    // 1. Get all parent documents in the top-level 'stories' collection.
    const parentStoriesSnapshot = await db.collection('stories').get();

    if (parentStoriesSnapshot.empty) {
      console.log("No parent story documents found.");
      return [];
    }

    // 2. For each parent document, fetch the stories from its nested 'stories' subcollection.
    for (const parentDoc of parentStoriesSnapshot.docs) {
      const nestedStoriesRef = parentDoc.ref.collection('stories');
      
      const documentSnapshots = await nestedStoriesRef.select(
          'title', 
          'coverImageUrl', 
          'coinCost', 
          'subgenre', 
          'publishedAt',
          'seriesId',
          'partNumber',
          'isPremium'
      ).get();

      const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
      allStories.push(...stories);
    }
    
    return allStories;
  } catch (error) {
    console.error(`Error fetching all stories:`, error);
    // Return an empty array to prevent the page from crashing.
    return [];
  }
}


/**
 * Fetches a single story by its ID, including its full content.
 * This function now checks both the top-level and nested collections.
 * @param storyId The ID of the story to fetch.
 * @returns The story object or null if not found.
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
    try {
        const db = getAdminDb();
        // First, try to get the document from the top-level collection.
        // This is necessary because standalone stories might live here.
        const topLevelDocRef = db.collection('stories').doc(storyId);
        const topLevelDoc = await topLevelDocRef.get();

        if (topLevelDoc.exists) {
            // Check if this document *also* has a nested 'stories' collection.
            // If so, it's a series container, not a story itself.
            const nestedStoriesSnapshot = await topLevelDoc.ref.collection('stories').limit(1).get();
            if (nestedStoriesSnapshot.empty) {
                return docToStory(topLevelDoc as QueryDocumentSnapshot);
            }
        }

        // If not found at the top level or it was a container, search within all subcollections.
        const groupQuery = db.collectionGroup('stories').where('storyId', '==', storyId).limit(1);
        const groupSnapshot = await groupQuery.get();

        if (groupSnapshot.empty) {
            return null;
        }

        return docToStory(groupSnapshot.docs[0] as QueryDocumentSnapshot);
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
