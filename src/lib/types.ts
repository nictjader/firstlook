
import { Timestamp as ClientTimestamp, FieldValue, DocumentData, QueryDocumentSnapshot as ClientQueryDocumentSnapshot } from 'firebase/firestore'; // For client-side
import { Timestamp as AdminTimestamp, QueryDocumentSnapshot as AdminQueryDocumentSnapshot } from 'firebase-admin/firestore'; // For server-side
import { z } from 'zod';

// --- Zod Schemas for Story Generation ---

export const StoryGenerationInputSchema = z.object({
  titleIdea: z.string(),
  subgenre: z.string(),
  mainCharacters: z.string(),
  characterNames: z.array(z.string()),
  plotSynopsis: z.string(),
  keyTropes: z.array(z.string()),
  desiredTone: z.string(),
  approxWordCount: z.number(),
  coverImagePrompt: z.string(),
});

export const StoryGenerationOutputSchema = z.object({
  storyId: z.string().describe('The unique ID for the generated story.'),
  title: z.string().describe('The final title of the story.'),
  success: z.boolean().describe('Whether the story generation was successful.'),
  error: z.string().nullable().describe('Any error message if the generation failed.'),
  storyData: z.custom<Omit<Story, 'publishedAt' | 'coverImageUrl'>>().optional(),
});


// --- Type Definitions ---

export type StoryGenerationInput = z.infer<typeof StoryGenerationInputSchema>;
export type StoryGenerationOutput = z.infer<typeof StoryGenerationOutputSchema>;

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
  primarySortKey: string;
  secondarySortKey: number;
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
    
    // Explicitly cast the document ID to a string to prevent type mismatches.
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

export interface AIStoryResult {
  storyData: Omit<Story, 'publishedAt' | 'coverImageUrl'>;
  storyId: string;
}

export interface GenerationResult {
  success: boolean;
  error: string | null;
  title: string;
  storyId: string;
  aiStoryResult?: AIStoryResult;
}

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
