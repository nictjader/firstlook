
import { type Timestamp as ClientTimestamp, type DocumentData, type QueryDocumentSnapshot as ClientQueryDocumentSnapshot, FieldPath } from 'firebase/firestore'; // For client-side
import { type Timestamp as AdminTimestamp, type QueryDocumentSnapshot as AdminQueryDocumentSnapshot, FieldPath as AdminFieldPath } from 'firebase-admin/firestore'; // For server-side

// --- Type Definitions ---

export interface UnlockedStoryInfo {
    storyId: string;
    unlockedAt: string;
}

export interface CoinTransaction {
    date: string;
    coins: number;
    amountUSD: number;
    stripeCheckoutId: string;
}

export interface UserProfile {
  userId: string;
  email: string | null;
  displayName?: string | null;
  coins: number;
  unlockedStories: UnlockedStoryInfo[];
  readStories: string[];
  favoriteStories: string[];
  preferences: {
    subgenres: Subgenre[];
  };
  createdAt: string;
  lastLogin: string;
  stripeCustomerId?: string;
}

export interface Story {
  storyId: string;
  title: string;
  characterNames?: string[];
  seriesId?: string;
  seriesTitle?: string;
  partNumber?: number;
  totalPartsInSeries?: number;
  isPremium: boolean;
  coinCost: number;
  content: string;
  synopsis: string;
  subgenre: Subgenre;
  wordCount: number;
  publishedAt: string;
  coverImageUrl?: string;
  coverImagePrompt: string;
  author?: string;
  status: 'published' | 'failed';
  seedTitleIdea?: string; // For preventing duplicate generation
}

export const ALL_SUBGENRES = ['contemporary', 'paranormal', 'historical', 'billionaire', 'second-chance', 'sci-fi'] as const;
export type Subgenre = (typeof ALL_SUBGENRES)[number];

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

export function docToStory(doc: ClientQueryDocumentSnapshot | AdminQueryDocumentSnapshot | DocumentData): Story {
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


export function docToUserProfile(docData: DocumentData, userId: string): UserProfile {
    const data = docData;
    return {
      userId: userId,
      email: data.email,
      displayName: data.displayName,
      coins: data.coins || 0,
      unlockedStories: (data.unlockedStories || []).map((s: any): UnlockedStoryInfo => {
          // Handle legacy format (array of strings)
          if (typeof s === 'string') {
              return { storyId: s, unlockedAt: new Date(0).toISOString() }; // Use epoch for old data
          }
          return { storyId: s.storyId, unlockedAt: safeToISOString(s.unlockedAt) };
      }),
      readStories: data.readStories || [],
      favoriteStories: data.favoriteStories || [],
      preferences: data.preferences || { subgenres: [] },
      createdAt: safeToISOString(data.createdAt),
      lastLogin: safeToISOString(data.lastLogin),
      stripeCustomerId: data.stripeCustomerId,
    };
}


// This is the output from the AI flow, which includes the full story data
// This should only be used on the server.
export type StoryGenerationOutput = {
  storyId: string;
  title: string;
  success: boolean;
  error: string | null;
  storyData?: Omit<Story, 'publishedAt' | 'coverImageUrl'>;
};


// This is the simplified object that the server action returns to the client.
// It is client-safe and prevents complex types from being passed.
export type GeneratedStoryIdentifiers = {
  success: boolean;
  error: string | null;
  title: string;
  storyId: string;
  coverImagePrompt?: string;
};


export interface CleanupResult {
    success: boolean;
    message: string;
    checked: number;
    updated: number;
}

export interface DatabaseMetrics {
  // Composition Metrics
  totalChapters: number;
  totalUniqueStories: number;
  standaloneStories: number;
  multiPartSeriesCount: number;
  storiesPerGenre: Record<string, number>;
  totalWordCount: number;
  avgWordCountFree: number;
  avgWordCountPaid: number;
  
  // Monetization Metrics
  totalPaidChapters: number;
  totalCoinCost: number;
  avgCoinCostPerPaidChapter: number;
  paidStandaloneStories: number;
  paidSeriesChapters: number;

  // USD Value Metrics
  totalValueUSD: number;
  avgValuePerPaidChapterUSD: number;

  // Data Quality Metrics
  duplicateTitles: Record<string, number>;
}

export interface ChapterAnalysis {
  chapterId: string;
  storyId: string;
  wordCount: number;
  currentCoinCost: number;
  storyType: 'Standalone' | 'Series';
  partNumber?: number;
  title: string;
  seriesTitle?: string;
  subgenre: Subgenre;
}
