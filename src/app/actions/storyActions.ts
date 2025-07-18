
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { Story, Subgenre } from '@/lib/types';
import { docToStory } from '@/lib/types';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

const STORIES_PER_PAGE = 12;

export async function getStories(
  subgenre: Subgenre | 'all',
  lastStory: Story | null
): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');

    // Simplified query to avoid needing a composite index.
    // We are trusting that only stories with 'published' status are in the DB.
    const constraints = [
      orderBy('publishedAt', 'desc'),
      limit(STORIES_PER_PAGE),
    ];

    if (subgenre !== 'all') {
      constraints.unshift(where('subgenre', '==', subgenre));
    }

    if (lastStory && lastStory.publishedAt) {
      constraints.push(startAfter(new Date(lastStory.publishedAt)));
    }
    
    // According to Firestore docs, types on query need to be more generic.
    const q: Query<DocumentData> = (storiesRef as any).query(...constraints);

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
