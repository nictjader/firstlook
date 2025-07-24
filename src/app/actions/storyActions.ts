
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { CoinPackage, PurchaseResult, Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';


/**
 * Fetches all stories from the database for the main story list.
 * This version is optimized for performance by only selecting the fields
 * necessary for the story cards on the homepage, avoiding fetching the
 * large 'content' field for every story.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    
    // Select only the fields needed for the story cards to improve performance.
    const documentSnapshots = await storiesRef.select(
        'title', 
        'coverImageUrl', 
        'coinCost', 
        'subgenre', 
        'publishedAt',
        'seriesId',
        'partNumber',
        'isPremium' // Ensure isPremium is fetched
    ).get();
    
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
 * Fetches a single story by its ID, including its full content.
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
 * This simplified version removes the orderBy clause to avoid potential index issues
 * and sorts the results in memory.
 * @param seriesId The ID of the series to fetch parts for.
 * @returns An array of story objects belonging to the series.
 */
export async function getSeriesParts(seriesId: string): Promise<Story[]> {
    if (!seriesId) {
        return [];
    }
    
    try {
        const db = getAdminDb();
        const storiesRef = db.collection('stories');
        
        // Simple query without ordering to avoid index issues
        const q = storiesRef.where('seriesId', '==', seriesId);
        const querySnapshot = await q.get();
        
        if (querySnapshot.empty) {
            return [];
        }
        
        const stories = querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
        
        // Sort manually by partNumber
        stories.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
        
        return stories;
        
    } catch (error) {
        console.error(`Error fetching series parts for seriesId ${seriesId}:`, error);
        return [];
    }
}
