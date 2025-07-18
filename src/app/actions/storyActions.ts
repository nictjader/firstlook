
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import {
  Query,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

const STORIES_PER_PAGE = 12;

export async function getStories(
  lastPrimarySortKey: string | null,
  lastSecondarySortKey: number | null
): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');

    let q: Query<DocumentData> = storiesRef
      .orderBy('primarySortKey', 'desc')
      .orderBy('secondarySortKey', 'asc')
      .limit(STORIES_PER_PAGE);

    if (lastPrimarySortKey && lastSecondarySortKey !== null) {
      // Correctly use startAfter with both sorting fields
      q = q.startAfter(lastPrimarySortKey, lastSecondarySortKey);
    }
    
    const documentSnapshots = await q.get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    // In case of an error, return an empty array to prevent crashing the client.
    return [];
  }
}
