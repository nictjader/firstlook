
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    // Step 1: Get all parent documents from the top-level 'stories' collection.
    const parentStoriesSnapshot = await db.collection('stories').get();

    if (parentStoriesSnapshot.empty) {
      console.log("No parent documents found in 'stories' collection.");
      return [];
    }

    const allStories: Story[] = [];
    
    // Step 2: For each parent document, query its nested 'stories' subcollection.
    for (const parentDoc of parentStoriesSnapshot.docs) {
      const subcollectionRef = parentDoc.ref.collection('stories');
      const documentSnapshots = await subcollectionRef.select(
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
    console.error(`Error fetching all stories with two-step query:`, error);
    return [];
  }
}
