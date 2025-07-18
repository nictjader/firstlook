
import { Timestamp as ClientTimestamp, FieldValue, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'; // For client-side
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'; // For server-side

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
  subgenre: string;
  wordCount: number;
  publishedAt: string;
  coverImageUrl?: string;
  coverImagePrompt: string;
  author?: string;
  tags?: string[];
  status: 'published' | 'failed';
  // Add new fields for sorting
  primarySortKey: string;
  secondarySortKey: number;
}

export const ALL_SUBGENRES = ['contemporary', 'paranormal', 'historical', 'billionaire', 'second-chance'] as const;
export type Subgenre = (typeof ALL_SUBGENRES)[number];

function safeToISOString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Date) {
        return timestamp.toISOString();
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    return new Date().toISOString();
}

export function docToStory(doc: QueryDocumentSnapshot | DocumentData): Story {
    const data = 'data' in doc ? doc.data() : doc;
    const storyId = 'id' in doc ? doc.id : (data.storyId || '');

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
      tags: data.tags || [],
      status: data.status || 'published',
      // Default sorting keys for older documents
      primarySortKey: data.primarySortKey || storyId,
      secondarySortKey: data.secondarySortKey === undefined ? 0 : data.secondarySortKey,
    };
}

export interface CoinPackage {
  id: string;
  coins: number;
  priceUSD: number;
  description: string;
  stripePriceId?: string;
}
