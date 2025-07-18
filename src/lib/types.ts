
import { Timestamp, FieldValue } from 'firebase/firestore'; // For client-side
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'; // For server-side

export interface Purchase {
  packageId: string;
  coins: number;
  priceUSD: number;
  // This can be a client-side or server-side timestamp, or the special FieldValue type
  purchasedAt: any;
}

export interface UserProfile {
  userId: string;
  email: string | null;
  displayName?: string | null;
  coins: number;
  unlockedStories: string[]; // Array of storyIds
  readStories: string[]; // Array of storyIds
  favoriteStories: string[]; // Array of storyIds
  purchaseHistory: Purchase[]; // Array of purchase records
  preferences: {
    subgenres: Subgenre[];
  };
  createdAt?: any;
  lastLogin?: any;
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
  // This can be any format from the DB, so we pass it raw
  publishedAt: any; 
  coverImageUrl?: string;
  coverImagePrompt: string;
  author?: string; 
  tags?: string[];
  status: 'published' | 'failed';
}

export interface CoinPackage {
  id: string;
  coins: number;
  priceUSD: number; 
  description: string;
  stripePriceId?: string;
}

export type Subgenre = 'contemporary' | 'paranormal' | 'historical' | 'billionaire' | 'second-chance';

export const ALL_SUBGENRES: Subgenre[] = ['contemporary', 'paranormal', 'historical', 'billionaire', 'second-chance'];

export function isValidSubgenre(value: string): value is Subgenre {
  return (ALL_SUBGENRES as string[]).includes(value);
}
