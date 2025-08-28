
"use client";

import type { Story, Subgenre } from "@/lib/types";
import { docToStory } from "@/lib/types";
import { collection, query, where, getDocs, documentId, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

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
  const { subgenre = 'all' } = options;

  const storiesRef = collection(db, 'stories');
  let q;

  if (subgenre === 'all') {
    q = query(storiesRef, orderBy('publishedAt', 'desc'));
  } else {
    q = query(storiesRef, where('subgenre', '==', subgenre), orderBy('publishedAt', 'desc'));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => docToStory(doc));
}


/**
 * Fetches multiple story documents from Firestore by their IDs.
 * This function is designed to be called from client components.
 * It efficiently fetches stories for arrays of up to 30 IDs.
 * @param storyIds An array of story IDs to fetch.
 * @returns A promise that resolves to an array of Story objects.
 */
export async function getStoriesByIds(storyIds: string[]): Promise<Story[]> {
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
  
  const stories = querySnapshot.docs.map(doc => docToStory(doc));

  // Reorder the fetched stories to match the original order of storyIds
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  return storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);
}
