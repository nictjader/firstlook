
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story, Subgenre } from '@/lib/types';
import { docToStory } from '@/lib/types';
import {
  Query,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';


export async function getStoriesBySubgenre(
  subgenre: Subgenre | 'all'
): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');

    let q: Query = storiesRef;

    if (subgenre && subgenre !== 'all') {
      q = q.where('subgenre', '==', subgenre);
    }
    
    // Sort all matching documents by publication date.
    // This simple query + order by on the same field does not require a custom index if the subgenre is a string.
    // If we were ordering by a different field, it would.
    q = q.orderBy('publishedAt', 'desc');

    const documentSnapshots = await q.get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    
    return stories;
  } catch (error) {
    console.error(`Error fetching stories for subgenre "${subgenre}":`, error);
    // Re-throw the error or return an empty array to indicate failure.
    // In a production app, you might want more sophisticated error handling.
    return [];
  }
}
