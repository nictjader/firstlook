
"use client";

import type { Story } from "@/lib/types";
import { docToStory } from "@/lib/types";
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

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
  // If it were, we would need to batch this.
  if (storyIds.length > 30) {
      console.warn(`Attempted to fetch ${storyIds.length} stories, but the limit is 30. Truncating request.`);
      storyIds = storyIds.slice(0, 30);
  }

  const storiesRef = collection(db, 'stories');
  const q = query(storiesRef, where(documentId(), 'in', storyIds));
  const querySnapshot = await getDocs(q);
  
  const stories = querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));

  // Reorder the fetched stories to match the original order of storyIds
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  const orderedStories = storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);

  return orderedStories;
}
