
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Fetches all stories from the database, handling both standalone stories
 * and chapters nested within series. This is the definitive function to
 * get a complete list of all stories.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storyMap = new Map<string, Story>();

    // 1. Get all documents from the collection group 'stories'.
    // This is the most efficient way to get all stories, nested or not.
    const allStoriesSnapshot = await db.collectionGroup('stories').orderBy('publishedAt', 'desc').get();

    allStoriesSnapshot.forEach(doc => {
        const story = docToStory(doc as QueryDocumentSnapshot);
        // Using a map ensures that if there are any duplicates, we only store one.
        storyMap.set(story.storyId, story);
    });

    const allStories = Array.from(storyMap.values());

    // Final sort in memory to ensure descending order by date.
    allStories.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    if (allStories.length === 0) {
      console.log("No stories found in the database.");
    }

    return allStories;

  } catch (error) {
    console.error(`Error fetching all stories:`, error);
    // In case of an error, return an empty array to prevent the page from crashing.
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
        // The most reliable way to find a specific story document, regardless of nesting,
        // is to use a collectionGroup query with a 'where' clause.
        const groupQuery = db.collectionGroup('stories').where('storyId', '==', storyId).limit(1);
        const groupSnapshot = await groupQuery.get();

        if (groupSnapshot.empty) {
            console.log(`Story with ID ${storyId} not found in any 'stories' collection.`);
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
