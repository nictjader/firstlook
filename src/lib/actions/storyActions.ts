
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story, Subgenre } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';

// A type guard to assert the admin SDK's snapshot type, which has a different method signature
// for `data()` than the client SDK's snapshot. This helps TypeScript understand the context.
type AdminQueryDocumentSnapshot = QueryDocumentSnapshot<DocumentData>;

/**
 * Fetches a single story by its ID using a direct document lookup.
 * @param storyId The ID of the story to fetch.
 * @returns The story object or null if not found.
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
    try {
        const db = await getAdminDb();
        const storyRef = db.collection('stories').doc(storyId);
        const storyDoc = await storyRef.get();

        if (!storyDoc.exists) {
            console.log(`Story with ID ${storyId} not found.`);
            return null;
        }

        return docToStory(storyDoc as AdminQueryDocumentSnapshot);
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
        const db = await getAdminDb();
        const storiesRef = db.collection('stories');
        
        const q = storiesRef.where('seriesId', '==', seriesId);
        const querySnapshot = await q.get();
        
        if (querySnapshot.empty) {
            return [];
        }
        
        const stories = querySnapshot.docs.map(doc => docToStory(doc as AdminQueryDocumentSnapshot));
        
        // Sort by partNumber in memory to ensure correct order.
        stories.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
        
        return stories;
        
    } catch (error) {
        console.error(`Error fetching series parts for seriesId ${seriesId}:`, error);
        return [];
    }
}

/**
 * Fetches all stories from the database for server-side generation.
 * @returns A promise that resolves to an array of all Story objects.
 */
export async function getStories(): Promise<Story[]> {
    try {
        const db = await getAdminDb();
        const storiesRef = db.collection('stories');
        const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => docToStory(doc));
    } catch (error) {
        console.error(`Error fetching all stories:`, error);
        return [];
    }
}
