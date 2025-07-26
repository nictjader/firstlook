

import { type Timestamp as ClientTimestamp, type FieldValue, type DocumentData, type QueryDocumentSnapshot as ClientQueryDocumentSnapshot } from 'firebase/firestore'; // For client-side
import { type Timestamp as AdminTimestamp, type QueryDocumentSnapshot as AdminQueryDocumentSnapshot } from 'firebase-admin/firestore'; // For server-side
import { z } from 'zod';

// --- Type Definitions ---

export interface Purchase {
  packageId: string;
  coins: number;
  priceUSD: number;
  purchasedAt: string;
}

export interface UnlockedStoryInfo {
    storyId: string;
    unlockedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string | null;
  displayName?: string | null;
  coins: number;
  unlockedStories: UnlockedStoryInfo[];
  readStories: string[];
  favoriteStories: string[];
  purchaseHistory: Purchase[];
  preferences: {
    subgenres: Subgenre[];
  };
  stripeCustomerId?: string; // Add this line
  createdAt: string;
  lastLogin: string;
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
  previewText: string;
  subgenre: Subgenre;
  wordCount: number;
  publishedAt: string;
  coverImageUrl?: string;
  coverImagePrompt: string;
  author?: string;
  status: 'published' | 'failed';
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
    console.warn("Unsupported timestamp format:", timestamp);
    return new Date().toISOString();
}

export function docToStory(doc: ClientQueryDocumentSnapshot | AdminQueryDocumentSnapshot | DocumentData): Story {
    const data = doc.data();
    if (!data) {
      throw new Error(`Document with id ${doc.id} has no data.`);
    }
    
    // In a collectionGroup query, the doc.id is the actual storyId.
    // For direct doc gets, the data may or may not have a storyId field.
    // We prioritize the field from the data if it exists, otherwise use the doc id.
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
      previewText: data.previewText || '',
      subgenre: data.subgenre || 'contemporary',
      wordCount: data.wordCount || 0,
      publishedAt: safeToISOString(data.publishedAt),
      coverImageUrl: data.coverImageUrl || '',
      coverImagePrompt: data.coverImagePrompt || '',
      author: data.author || 'Anonymous',
      status: data.status || 'published',
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
      purchaseHistory: (data.purchaseHistory || []).map((p: any): Purchase => ({
          ...p,
          purchasedAt: safeToISOString(p.purchasedAt),
      })),
      preferences: data.preferences || { subgenres: [] },
      stripeCustomerId: data.stripeCustomerId,
      createdAt: safeToISOString(data.createdAt),
      lastLogin: safeToISOString(data.lastLogin),
    };
}


export interface CoinPackage {
  id: string;
  coins: number;
  priceUSD: number;
  description: string;
  stripePriceId?: string;
  bestValue?: boolean;
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

export interface StoryCountBreakdown {
  totalUniqueStories: number;
  standaloneStories: number;
  multiPartSeriesCount: number;
  storiesPerGenre: Record<string, number>;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface DatabaseMetrics {
  // Composition Metrics
  totalChapters: number;
  totalUniqueStories: number;
  standaloneStories: number;
  multiPartSeriesCount: number;
  storiesPerGenre: Record<string, number>;
  totalWordCount: number;
  
  // Monetization Metrics
  totalPaidChapters: number;
  totalCoinCost: number;
  avgCoinCostPerPaidChapter: number;
  paidStandaloneStories: number;
  paidSeriesChapters: number;

  // USD Value Metrics
  totalValueUSD: number;
  avgValuePerPaidChapterUSD: number;
}
