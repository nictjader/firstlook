
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
  lastPublishedAt: string | null
): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');

    let q: Query<DocumentData> = storiesRef
      .orderBy('publishedAt', 'desc') // Sort by date only, which Firestore can handle with a default index
      .limit(STORIES_PER_PAGE);

    if (lastPublishedAt) {
      q = q.startAfter(new Date(lastPublishedAt));
    }
    
    const documentSnapshots = await q.get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}
