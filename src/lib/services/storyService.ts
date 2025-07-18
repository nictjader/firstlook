'use server';

import type { Story, Subgenre } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';

// Helper to safely convert Firestore DocumentSnapshot to a Story object
function docToStory(doc: FirebaseFirestore.DocumentSnapshot): Story | null {
  try {
    const data = doc.data();
    if (!data) {
      return null;
    }
    
    return {
      storyId: doc.id,
      title: data.title || 'Untitled',
      characterNames: data.characterNames || [],
      seriesId: data.seriesId || undefined,
      seriesTitle: data.seriesTitle || undefined,
      partNumber: data.partNumber || undefined,
      totalPartsInSeries: data.totalPartsInSeries || undefined,
      isPremium: data.isPremium || false,
      coinCost: data.coinCost || 0,
      content: data.content || '',
      previewText: data.previewText || '',
      subgenre: data.subgenre || 'contemporary',
      wordCount: data.wordCount || 0,
      publishedAt: data.publishedAt?.toDate().toISOString() || new Date().toISOString(),
      coverImageUrl: data.coverImageUrl || '',
      coverImagePrompt: data.coverImagePrompt || '',
      author: data.author || 'Anonymous',
      tags: data.tags || [],
      status: data.status || 'published',
    };
  } catch (error) {
    console.error(`Error converting document ${doc.id} to Story:`, error);
    return null;
  }
}

export async function getStoriesBySeriesId(seriesId: string): Promise<Story[]> {
    if (!seriesId) return [];
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const q = storiesRef.where('seriesId', '==', seriesId).orderBy('partNumber', 'asc');
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
        return [];
    }
    return querySnapshot.docs.map(docToStory).filter((s): s is Story => !!s);
}

// Helper function to group stories by series and sort them
function groupAndSortStories(stories: Story[]): Story[] {
  const standaloneStories: Story[] = [];
  const seriesStoriesMap = new Map<string, Story[]>();

  // 1. Separate standalone stories from series parts
  for (const story of stories) {
    if (story.seriesId && story.totalPartsInSeries && story.totalPartsInSeries > 1) {
      if (!seriesStoriesMap.has(story.seriesId)) {
        seriesStoriesMap.set(story.seriesId, []);
      }
      // Ensure we don't add duplicate stories to a series
      if (!seriesStoriesMap.get(story.seriesId)!.some(s => s.storyId === story.storyId)) {
        seriesStoriesMap.get(story.seriesId)!.push(story);
      }
    } else {
      standaloneStories.push(story);
    }
  }

  // 2. Create final series groups, ensuring all parts are present
  const seriesGroups: Story[][] = [];
  for (const storiesInSeries of seriesStoriesMap.values()) {
    // Only include a series if all its parts are present in the fetched list
    if (storiesInSeries.length > 0 && storiesInSeries.length === storiesInSeries[0].totalPartsInSeries) {
      // Sort the parts of the series correctly
      storiesInSeries.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
      seriesGroups.push(storiesInSeries);
    } else {
       // If a series is incomplete, treat its fetched parts as standalone stories to avoid breaking UI.
       standaloneStories.push(...storiesInSeries);
    }
  }
  
  // 3. Combine and sort everything based on the publication date of the first part or the standalone story
  const allEntries: (Story | Story[])[] = [...standaloneStories, ...seriesGroups];
  
  allEntries.sort((a, b) => {
    const dateA = new Date(Array.isArray(a) ? a[0].publishedAt : a.publishedAt).getTime();
    const dateB = new Date(Array.isArray(b) ? b[0].publishedAt : b.publishedAt).getTime();
    return dateB - dateA; // Sort descending (newest first)
  });

  // 4. Flatten the result back into a single story array
  return allEntries.flat();
}


// Main function to fetch stories.
// This is now the single source of truth for fetching lists of stories.
export async function getStoriesWithSeriesGrouping(
  { filter = {}, pagination = {} }: {
    filter?: { subgenre?: Subgenre | 'all' };
    pagination?: { limit?: number; offset?: number };
  } = {}
): Promise<Story[]> {
  const db = getAdminDb();
  let storiesQuery: FirebaseFirestore.Query = db.collection('stories');

  // Apply base filters
  storiesQuery = storiesQuery.where('status', '==', 'published');
  
  if (filter.subgenre && filter.subgenre !== 'all') {
    storiesQuery = storiesQuery.where('subgenre', '==', filter.subgenre);
  }
  
  try {
    // 1. Fetch ALL documents that match the filter. This is the key change.
    // We do the sorting and grouping in memory to ensure series are never broken up.
    const querySnapshot = await storiesQuery.orderBy('publishedAt', 'desc').get();
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const allStories = querySnapshot.docs
      .map(docToStory)
      .filter((story): story is Story => story !== null);

    // 2. Group and sort the entire list correctly.
    const groupedAndSortedStories = groupAndSortStories(allStories);
    
    // 3. Apply pagination to the fully sorted list.
    const offset = pagination.offset || 0;
    const limit = pagination.limit || 12;
    
    return groupedAndSortedStories.slice(offset, offset + limit);

  } catch (error) {
    console.error('[getStoriesWithSeriesGrouping] A critical error occurred:', error);
    return [];
  }
}

// Legacy getStories function - can be removed or deprecated if no longer used elsewhere.
// For now, let's keep it to avoid breaking anything unexpected.
export async function getStories(
  { filter = {}, pagination = {} }: {
    filter?: { subgenre?: Subgenre | 'all' };
    pagination?: { limit?: number; cursor?: string };
  } = {}
): Promise<Story[]> {
    const offset = pagination.cursor ? parseInt(pagination.cursor, 10) : 0;
    return getStoriesWithSeriesGrouping({filter, pagination: { limit: pagination.limit, offset }});
}


// Function to get a single story
export async function getStoryById(id: string): Promise<Story | undefined> {
  const db = getAdminDb();
  const storyDocRef = db.collection('stories').doc(id);
  const docSnap = await storyDocRef.get();
  
  if (!docSnap.exists) {
    return undefined;
  }
  const story = docToStory(docSnap);
  return story ?? undefined;
}

export async function getAllStoryTitles(): Promise<Set<string>> {
  const db = getAdminDb();
  const storiesRef = db.collection('stories');
  const querySnapshot = await storiesRef.get();
  const titles = new Set<string>();
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.title) {
      titles.add(data.title.toLowerCase());
    }
  });
  return titles;
}

export async function getStoriesByIds(storyIds: string[]): Promise<Story[]> {
  if (!storyIds || storyIds.length === 0) {
    return [];
  }
  const db = getAdminDb();
  const stories: Story[] = [];

  const MAX_IDS_PER_QUERY = 30; 
  for (let i = 0; i < storyIds.length; i += MAX_IDS_PER_QUERY) {
    const batchIds = storyIds.slice(i, i + MAX_IDS_PER_QUERY);
    const storiesRef = db.collection('stories');
    const q = storiesRef.where('__name__', 'in', batchIds);
    const querySnapshot = await q.get();
    const batchStories = querySnapshot.docs.map(docToStory).filter((s): s is Story => !!s);
    stories.push(...batchStories);
  }
  
  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  const orderedStories = storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);
  
  return orderedStories;
}
