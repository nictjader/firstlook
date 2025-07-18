
import { Timestamp, FieldValue, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'; // For client-side
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'; // For server-side

export interface Purchase {
  packageId: string;
  coins: number;
  priceUSD: number;
  purchasedAt: string; // Changed to string
}

export interface UserProfile {
  userId: string;
  email: string | null;
  displayName?: string | null;
  coins: number;
  unlockedStories: string[]; // Array of storyIds
  readStories: string[]; // Array of storyIds
  favoriteStories: string[]; // Array of storyIds
  purchaseHistory: Purchase[];
  preferences: {
    subgenres: Subgenre[];
  };
  createdAt: string; // Changed to string
  lastLogin: string; // Changed to string
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
  subgenre: string;
  wordCount: number;
  publishedAt: string; // Changed to string for serialization
  coverImageUrl?: string;
  coverImagePrompt: string;
  author?: string;
  tags?: string[];
  status: 'published' | 'failed';
}

// Define the array of subgenres as a constant tuple
export const ALL_SUBGENRES = ['contemporary', 'paranormal', 'historical', 'billionaire', 'second-chance'] as const;

// Derive the Subgenre type from the constant array
export type Subgenre = (typeof ALL_SUBGENRES)[number];

function safeToISOString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    return new Date().toISOString();
}

/**
 * Converts a Firestore document snapshot into a Story object, safely handling timestamps.
 * This is the single source of truth for story conversion.
 * @param doc The Firestore document snapshot.
 * @returns A Story object.
 */
export function docToStory(doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Story {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    const id = typeof (doc as any).id === 'string' ? (doc as any).id : '';

    return {
      storyId: id,
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
      tags: data.tags || [],
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
