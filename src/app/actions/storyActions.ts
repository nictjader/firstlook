
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

    // Step 1: Get all documents from the top-level 'stories' collection.
    // These are either standalone stories or series containers.
    const topLevelSnapshot = await db.collection('stories').get();

    const subcollectionPromises: Promise<void>[] = [];

    for (const parentDoc of topLevelSnapshot.docs) {
      const parentData = parentDoc.data();
      
      // Check if this document is a standalone story (has a title and content)
      // or just a container for a series.
      if (parentData.title && parentData.content) {
        // This is a standalone story.
        allStories.push(docToStory(parentDoc as QueryDocumentSnapshot));
      }

      // Step 2: For each top-level document, check for and query its nested 'stories' subcollection.
      const subcollectionRef = parentDoc.ref.collection('stories');
      const subcollectionPromise = subcollectionRef.select(
          'title', 
          'coverImageUrl', 
          'coinCost', 
          'subgenre', 
          'publishedAt',
          'seriesId',
          'partNumber',
          'isPremium'
      ).get().then(subcollectionSnapshot => {
        if (!subcollectionSnapshot.empty) {
          const nestedStories = subcollectionSnapshot.docs.map(storyDoc => docToStory(storyDoc as QueryDocumentSnapshot));
          allStories.push(...nestedStories);
        }
      });
      subcollectionPromises.push(subcollectionPromise);
    }

    // Wait for all the subcollection queries to complete.
    await Promise.all(subcollectionPromises);

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
