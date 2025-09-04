
import { type DocumentData, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { Story, UserProfile, UnlockedStoryInfo } from '@/lib/types';

// This helper function robustly handles Timestamps from both client and server,
// as well as already-serialized date strings.
function safeToISOString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    // Handle Firestore Timestamps (both client and admin)
    if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    // Handle JS Date objects
    if (timestamp instanceof Date) {
        return timestamp.toISOString();
    }
    // Handle ISO date strings (pass them through)
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    // Fallback for unexpected types
    console.warn("Unsupported timestamp format:", timestamp, "Returning current date as fallback.");
    return new Date().toISOString();
}

// Server-side helper for converting Firestore Admin doc to Story
export function docToStoryAdmin(doc: QueryDocumentSnapshot | DocumentData): Story {
    const data = doc.data();
    if (!data) {
      throw new Error(`Document with id ${doc.id} has no data.`);
    }
    
    const storyId = data.storyId || doc.id;
    const isSeriesStory = !!data.seriesId && typeof data.partNumber === 'number';

    return {
      storyId: storyId,
      title: data.title || 'Untitled',
      characterNames: data.characterNames || [],
      seriesId: isSeriesStory ? data.seriesId : undefined,
      seriesTitle: isSeriesStory ? data.seriesTitle : undefined,
      partNumber: isSeriesStory ? data.partNumber : undefined,
      totalPartsInSeries: isSeriesStory ? data.totalPartsInSeries : undefined,
      isPremium: data.isPremium || false,
      coinCost: data.coinCost || 0,
      content: data.content || '',
      synopsis: data.synopsis || data.previewText || '',
      subgenre: data.subgenre || 'contemporary',
      wordCount: data.wordCount || 0,
      publishedAt: safeToISOString(data.publishedAt),
      coverImageUrl: data.coverImageUrl || '',
      coverImagePrompt: data.coverImagePrompt || '',
      author: data.author || 'Anonymous',
      status: data.status || 'published',
      seedTitleIdea: data.seedTitleIdea,
    };
}


// Server-side helper for converting Firestore Admin doc to UserProfile
export function docToUserProfileAdmin(docData: DocumentData, userId: string): UserProfile {
    const data = docData;
    return {
      userId: userId,
      email: data.email,
      displayName: data.displayName,
      coins: data.coins || 0,
      unlockedStories: (data.unlockedStories || []).map((s: any): UnlockedStoryInfo => {
          if (typeof s === 'string') {
              return { storyId: s, unlockedAt: new Date(0).toISOString() }; 
          }
          return { storyId: s.storyId, unlockedAt: safeToISOString(s.unlockedAt) };
      }),
      readStories: data.readStories || [],
      favoriteStories: data.favoriteStories || [],
      preferences: data.preferences || { subgenres: [] },
      createdAt: safeToISOString(data.createdAt),
      lastLogin: safeToISOString(data.lastLogin),
    };
}
