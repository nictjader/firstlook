
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

export interface UserProfile {
  userId: string;
  email: string | null;
  displayName?: string | null;
  coins: number;
  unlockedStories: string[];
  readStories: string[];
  favoriteStories: string[];
  purchaseHistory: Purchase[];
  preferences: {
    subgenres: Subgenre[];
  };
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
  if (timestamp instanceof Date) {
      return timestamp.toISOString();
  }
  // Check for Firestore Timestamp-like objects (both client and admin SDKs)
  if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
  }
  // Handle cases where it might already be a string
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  // Final fallback
  return new Date().toISOString();
}

export function docToStory(doc: ClientQueryDocumentSnapshot | AdminQueryDocumentSnapshot | DocumentData): Story {
    const data = doc.data();
    if (!data) {
      throw new Error("Document data is missing.");
    }
    
    const storyId = String(doc.id);

    return {
      storyId: storyId,
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
      publishedAt: safeToISOString(data.publishedAt),
      coverImageUrl: data.coverImageUrl || '',
      coverImagePrompt: data.coverImagePrompt || '',
      author: data.author || 'Anonymous',
      status: data.status || 'published',
    };
}

export interface CoinPackage {
  id: string;
  coins: number;
  priceUSD: number;
  description: string;
  stripePriceId?: string;
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

    