
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
    // This query (filter on one field, sort on another) requires a composite index in Firestore.
    // If the index doesn't exist, this query will fail.
    // The most robust solution is to sort by publishedAt on the server and then sort/group on the client.
    q = q.orderBy('publishedAt', 'desc');

    const documentSnapshots = await q.get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    
    return stories;
  } catch (error) {
    console.error(`Error fetching stories for subgenre "${subgenre}":`, error);
    // In a production app, you might want more sophisticated error handling.
    // Returning an empty array to prevent the page from crashing.
    return [];
  }
}

