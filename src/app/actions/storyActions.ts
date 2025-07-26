'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Fetches all stories from the database using a robust two-step process.
 * First, it gets all parent documents in the top-level 'stories' collection.
 * Then, it queries the 'stories' subcollection within each parent.
 * This avoids collectionGroup indexing issues and is more resilient.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const allStories: Story[] = [];

    // 1. Fetch all top-level documents in the 'stories' collection.
    // These documents act as containers for the nested stories.
    const seriesContainerSnapshot = await db.collection('stories').get();

    if (seriesContainerSnapshot.empty) {
      console.log("No series container documents found in 'stories' collection.");
      return [];
    }

    // 2. For each container, fetch all documents from its nested 'stories' subcollection.
    for (const seriesDoc of seriesContainerSnapshot.docs) {
      const nestedStoriesSnapshot = await seriesDoc.ref.collection('stories').get();
      if (!nestedStoriesSnapshot.empty) {
        const nestedStories = nestedStoriesSnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
        allStories.push(...nestedStories);
      } else {
        // This handles standalone stories that might exist at the top level
        // if they don't have a nested 'stories' collection.
        const standaloneStory = docToStory(seriesDoc as QueryDocumentSnapshot);
        // A simple check to ensure it's a real story, not just an empty container
        if (standaloneStory.title) {
            allStories.push(standaloneStory);
        }
      }
    }
    
    return allStories;
  } catch (error) {
    console.error(`Error fetching all stories with two-step method:`, error);
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
