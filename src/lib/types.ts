
import { Timestamp, FieldValue } from 'firebase/firestore'; // For client-side
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

export interface CoinPackage {
  id: string;
  coins: number;
  priceUSD: number; 
  description: string;
  stripePriceId?: string;
}

// Define the array of subgenres as a constant tuple
export const ALL_SUBGENRES = ['contemporary', 'paranormal', 'historical', 'billionaire', 'second-chance'] as const;

// Derive the Subgenre type from the constant array
export type Subgenre = (typeof ALL_SUBGENRES)[number];

export function isValidSubgenre(value: string): value is Subgenre {
  return (ALL_SUBGENRES as readonly string[]).includes(value);
}
