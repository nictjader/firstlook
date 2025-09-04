
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story, Subgenre } from '@/lib/types';
import { docToStoryAdmin } from '@/lib/firebase/server-types';
import type { Query, QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { collection, query, where, getDocs, documentId, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { docToStoryClient } from '@/lib/types';


// --- SERVER-ONLY ACTIONS ---
// These functions are guaranteed to only run on the server.

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

        return docToStoryAdmin(storyDoc);
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
        
        const stories = querySnapshot.docs.map(doc => docToStoryAdmin(doc));
        
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
        return snapshot.docs.map(doc => docToStoryAdmin(doc));
    } catch (error) {
        console.error(`Error fetching all stories:`, error);
        return [];
    }
}

// --- CLIENT-CALLABLE ACTIONS ---
// The 'use client' directive below marks these functions as usable on the client.
// These functions use the client-side Firebase SDK.

interface GetStoriesOptions {
  subgenre?: Subgenre | 'all';
  limit?: number;
}

/**
 * Fetches stories from the database with optional filters.
 * This is the primary function for fetching story lists on the client.
 * @param options - An object with filtering options like subgenre and limit.
 * @returns A promise that resolves to an array of Story objects.
 */
export async function getStoriesClient(options: GetStoriesOptions = {}): Promise<Story[]> {
  'use client';
  const { subgenre = 'all' } = options;

  const storiesRef = collection(db, 'stories');
  let q;

  if (subgenre === 'all') {
    q = query(storiesRef, orderBy('publishedAt', 'desc'));
  } else {
    q = query(storiesRef, where('subgenre', '==', subgenre), orderBy('publishedAt', 'desc'));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => docToStoryClient(doc));
}


/**
 * Fetches multiple story documents from Firestore by their IDs.
 * This function is designed to be called from client components.
 * It efficiently fetches stories for arrays of up to 30 IDs.
 * @param storyIds An array of story IDs to fetch.
 * @returns A promise that resolves to an array of Story objects.
 */
export async function getStoriesByIds(storyIds: string[]): Promise<Story[]> {
  'use client';
  if (!storyIds || storyIds.length === 0) {
    return [];
  }
  
  // Firestore's 'in' query supports a maximum of 30 elements.
  // For this app's purposes, fetching more than 30 at once is not expected.
  if (storyIds.length > 30) {
      console.warn(`Attempted to fetch ${storyIds.length} stories, but the limit is 30. Truncating request.`);
      storyIds = storyIds.slice(0, 30);
  }

  const storiesRef = collection(db, 'stories');
  const q = query(storiesRef, where(documentId(), 'in', storyIds));
  const querySnapshot = await getDocs(q);
  
  const stories = querySnapshot.docs.map(doc => docToStoryClient(doc));

  // Reorder the fetched stories to match the original order of storyIds
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  return storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);
}
