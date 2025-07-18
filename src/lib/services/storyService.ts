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
      seriesId: data.seriesId || null,
      seriesTitle: data.seriesTitle || null,
      partNumber: data.partNumber || null,
      totalPartsInSeries: data.totalPartsInSeries || null,
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
  // Separate standalone stories from series stories
  const standaloneStories: Story[] = [];
  const seriesStoriesMap = new Map<string, Story[]>();
  
  for (const story of stories) {
    if (story.seriesId) {
      if (!seriesStoriesMap.has(story.seriesId)) {
        seriesStoriesMap.set(story.seriesId, []);
      }
      seriesStoriesMap.get(story.seriesId)!.push(story);
    } else {
      standaloneStories.push(story);
    }
  }
  
  // Sort series stories by part number within each series
  for (const seriesStories of seriesStoriesMap.values()) {
    seriesStories.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
  }
  
  // Create series groups with metadata for sorting
  const seriesGroups = Array.from(seriesStoriesMap.values()).map(storiesInSeries => {
    // Use the earliest publishedAt date from the series as the group's sort key
    const earliestDate = storiesInSeries.reduce((earliest, story) => {
      return story.publishedAt < earliest ? story.publishedAt : earliest;
    }, storiesInSeries[0].publishedAt);
    
    return {
      stories: storiesInSeries,
      sortDate: earliestDate,
    };
  });
  
  // Sort series groups by their earliest publication date
  seriesGroups.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
  
  // Sort standalone stories by publication date
  standaloneStories.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Interleave series groups and standalone stories based on publication dates
  const result: Story[] = [];
  let seriesIndex = 0;
  let standaloneIndex = 0;
  
  while (seriesIndex < seriesGroups.length || standaloneIndex < standaloneStories.length) {
    const nextSeriesGroup = seriesGroups[seriesIndex];
    const nextStandalone = standaloneStories[standaloneIndex];
    
    if (nextSeriesGroup && (!nextStandalone || new Date(nextSeriesGroup.sortDate) >= new Date(nextStandalone.publishedAt))) {
      result.push(...nextSeriesGroup.stories);
      seriesIndex++;
    } else if (nextStandalone) {
      result.push(nextStandalone);
      standaloneIndex++;
    } else {
      break; // Should not happen if logic is correct
    }
  }
  
  return result;
}

// Main function to fetch stories with series grouping logic
export async function getStories(
  { filter = {}, pagination = {} }: {
    filter?: { subgenre?: Subgenre | 'all' };
    pagination?: { limit?: number; cursor?: string };
  } = {}
): Promise<Story[]> {
  const db = getAdminDb();
  let storiesQuery: FirebaseFirestore.Query = db.collection('stories');

  // Base filters
  storiesQuery = storiesQuery.where('status', '==', 'published');
  
  if (filter.subgenre && filter.subgenre !== 'all') {
    storiesQuery = storiesQuery.where('subgenre', '==', filter.subgenre);
  }
  
  // For series grouping to work properly, we need to fetch more stories initially
  const fetchLimit = pagination.limit ? pagination.limit * 3 : 36;
  
  storiesQuery = storiesQuery.orderBy('publishedAt', 'desc');

  if (pagination.cursor) {
    try {
      const cursorDoc = await db.collection('stories').doc(pagination.cursor).get();
      if (cursorDoc.exists) {
        storiesQuery = storiesQuery.startAfter(cursorDoc);
      }
    } catch(e) {
      console.error(`Error fetching cursor document:`, e);
    }
  }

  storiesQuery = storiesQuery.limit(fetchLimit);

  try {
    const querySnapshot = await storiesQuery.get();
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const stories = querySnapshot.docs
      .map(docToStory)
      .filter((story): story is Story => story !== null);

    const groupedStories = groupAndSortStories(stories);
    
    const finalLimit = pagination.limit || 12;
    return groupedStories.slice(0, finalLimit);

  } catch (error) {
    console.error('[getStories] A critical error occurred during query execution:', error);
    return [];
  }
}

// Enhanced function for series-aware pagination
export async function getStoriesWithSeriesGrouping(
  { filter = {}, pagination = {} }: {
    filter?: { subgenre?: Subgenre | 'all' };
    pagination?: { limit?: number; offset?: number };
  } = {}
): Promise<Story[]> {
  const db = getAdminDb();
  let storiesQuery: FirebaseFirestore.Query = db.collection('stories');

  storiesQuery = storiesQuery.where('status', '==', 'published');
  
  if (filter.subgenre && filter.subgenre !== 'all') {
    storiesQuery = storiesQuery.where('subgenre', '==', filter.subgenre);
  }
  
  // Fetch all stories up to a reasonable limit for in-memory processing
  // This is a trade-off for correct series grouping
  const allStoriesQuery = storiesQuery.limit(1000);

  try {
    const querySnapshot = await allStoriesQuery.get();
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const allStories = querySnapshot.docs
      .map(docToStory)
      .filter((story): story is Story => story !== null);

    const groupedStories = groupAndSortStories(allStories);
    
    const offset = pagination.offset || 0;
    const limit = pagination.limit || 12;
    
    return groupedStories.slice(offset, offset + limit);

  } catch (error) {
    console.error('[getStoriesWithSeriesGrouping] A critical error occurred:', error);
    return [];
  }
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
