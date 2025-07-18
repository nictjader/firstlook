
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import {
  Query,
  DocumentData,
} from 'firebase-admin/firestore';

const STORIES_PER_PAGE = 12;

export async function getStories(
  lastPublishedAt: string | null
): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');

    let q: Query<DocumentData> = storiesRef
      .orderBy('publishedAt', 'desc')
      .limit(STORIES_PER_PAGE);

    if (lastPublishedAt) {
      // When using startAfter, you need to provide the value from the last document.
      // Firestore Admin SDK can take a Date object directly.
      q = q.startAfter(new Date(lastPublishedAt));
    }
    
    const documentSnapshots = await q.get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc));
    
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    // In case of an error, return an empty array to prevent crashing the client.
    return [];
  }
}
