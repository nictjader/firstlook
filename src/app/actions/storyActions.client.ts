
"use client";

import type { Story } from "@/lib/types";
import { docToStory } from "@/lib/types";
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

/**
 * Fetches multiple story documents from Firestore by their IDs.
 * This function is designed to be called from client components.
 * It efficiently fetches stories in batches of 30 to stay within Firestore's query limits.
 * @param storyIds An array of story IDs to fetch.
 * @returns A promise that resolves to an array of Story objects, maintaining the original order.
 */
export async function getStoriesByIds(storyIds: string[]): Promise<Story[]> {
  if (!storyIds || storyIds.length === 0) {
    return [];
  }
  const stories: Story[] = [];

  // Firestore's `in` query supports a maximum of 30 elements.
  const MAX_IDS_PER_QUERY = 30;
  for (let i = 0; i < storyIds.length; i += MAX_IDS_PER_QUERY) {
    const batchIds = storyIds.slice(i, i + MAX_IDS_PER_QUERY);
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where(documentId(), 'in', batchIds));
    const querySnapshot = await getDocs(q);
    const batchStories = querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    stories.push(...batchStories);
  }

  // Reorder the fetched stories to match the original order of storyIds
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  const orderedStories = storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);

  return orderedStories;
}
