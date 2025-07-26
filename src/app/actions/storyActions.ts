
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collectionGroup('stories');
    
    const documentSnapshots = await storiesRef.select(
        'title', 
        'coverImageUrl', 
        'coinCost', 
        'subgenre', 
        'publishedAt',
        'seriesId',
        'partNumber',
        'isPremium'
    ).get();
    
    if (documentSnapshots.empty) {
      console.log("No documents found in 'stories' collection group.");
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    
    return stories;
  } catch (error) {
    console.error(`Error fetching all stories with collectionGroup:`, error);
    return [];
  }
}
