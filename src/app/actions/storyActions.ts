
'use server';

import { getStoriesByIds, getStories } from '@/lib/services/storyService';
import type { Story, Subgenre } from '@/lib/types';

const STORIES_PER_PAGE = 12;

/**
 * A Server Action to safely fetch story details by their IDs from a client component.
 * @param storyIds An array of story IDs to fetch.
 * @returns A promise that resolves to an array of Story objects.
 */
export async function getStoriesByIdsAction(storyIds: string[]): Promise<Story[]> {
  // The call to the service is safe here because this is a Server Action.
  return getStoriesByIds(storyIds);
}

/**
 * Fetches the next page of stories for pagination.
 * @param subgenre The currently selected subgenre.
 * @param cursor The ID of the last story from the previous page.
 * @returns A promise that resolves to an array of Story objects for the next page.
 */
export async function getMoreStoriesAction(subgenre: Subgenre | 'all', cursor: string): Promise<Story[]> {
  const stories = await getStories(
    { 
      filter: { subgenre: subgenre !== 'all' ? subgenre : undefined },
      pagination: { limit: STORIES_PER_PAGE, cursor: cursor }
    }
  );
  return stories;
}
