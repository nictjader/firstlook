
'use server';

import { generateStory, StoryGenerationInput } from '@/ai/flows/story-generator';
import { storySeeds } from '@/lib/story-seeds';
import { getAdminDb } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { ai } from '@/ai';
import { Story, Subgenre } from '@/lib/types';
import { extractBase64FromDataUri } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { collection, getDocs, query, select, type QueryDocumentSnapshot, writeBatch } from 'firebase-admin/firestore';


// The output from the pure AI generation part of the action.
export interface AIStoryResult {
  storyData: Omit<Story, 'storyId' | 'publishedAt' | 'coverImageUrl'>;
  storyId: string;
}

export interface GenerationResult {
  success: boolean;
  error: string | null;
  title: string;
  storyId: string;
  // This will be populated if the text generation part is successful
  aiStoryResult?: AIStoryResult;
}

export interface StoryCountBreakdown {
  totalStories: number;
  standaloneStories: number;
  multiPartSeriesCount: number;
  storiesPerGenre: Record<string, number>;
}


/**
 * Selects a random story seed from the predefined list, ensuring it hasn't been used.
 * @returns A randomly selected StorySeed or null if all seeds are used.
 */
async function selectUnusedSeed(): Promise<StoryGenerationInput | null> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    // Fetch only the 'title' field to be efficient
    const q = query(storiesRef, select('title'));
    const snapshot = await getDocs(q);
    const existingTitles = new Set(snapshot.docs.map(doc => doc.data().title.split(' - Part ')[0]));

    const unusedSeeds = storySeeds.filter(seed => !existingTitles.has(seed.titleIdea));

    if (unusedSeeds.length === 0) {
        return null; // All seeds have been used
    }

    const randomIndex = Math.floor(Math.random() * unusedSeeds.length);
    return unusedSeeds[randomIndex];
}

/**
 * Generates story text and metadata using an AI flow from an unused seed.
 * It does NOT write to the database. It returns the generated data to the client.
 * @returns A promise that resolves to a GenerationResult object containing the AI-generated story data.
 */
export async function generateStoryAI(): Promise<GenerationResult> {
  const seed = await selectUnusedSeed();

  if (!seed) {
    return {
      success: false,
      error: "All available story seeds have been used. No new stories can be generated.",
      title: "N/A",
      storyId: '',
    };
  }

  try {
    const storyResult = await generateStory(seed);

    if (!storyResult.success || !storyResult.storyId || !storyResult.storyData) {
      throw new Error(storyResult.error || 'Story generation flow failed to return story data.');
    }

    return {
      success: true,
      error: null,
      title: storyResult.title,
      storyId: storyResult.storyId,
      aiStoryResult: {
        storyData: storyResult.storyData,
        storyId: storyResult.storyId,
      },
    };

  } catch (error: any) {
    console.error(`Critical error in generateStoryAI for seed "${seed.titleIdea}":`, error);
    return {
      success: false,
      error: error.message,
      title: seed.titleIdea,
      storyId: '',
    };
  }
}

/**
 * Generates a cover image using an AI model and uploads it to Firebase Storage.
 * This is a separate action that can be called by the client after the story is saved.
 * @param storyId The ID of the story to associate the image with.
 * @param prompt The prompt for the image generation model.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export async function generateAndUploadCoverImageAction(storyId: string, prompt: string): Promise<string> {
    if (!prompt) {
        console.warn(`No cover image prompt for story ${storyId}. Using placeholder.`);
        return 'https://placehold.co/600x900/D87093/F9E4EB.png?text=No+Prompt';
    }
    
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: prompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media || !media.url) {
            throw new Error('Image generation failed to return media.');
        }
        
        const { base64Data, mimeType } = extractBase64FromDataUri(media.url);
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const bucket = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        const imagePath = `story-covers/${storyId}.png`;
        const file = bucket.file(imagePath);

        await file.save(imageBuffer, {
          metadata: {
            contentType: mimeType || 'image/png',
            metadata: {
              firebaseStorageDownloadTokens: uuidv4(),
            }
          },
        });

        // Make the file public and get the URL
        await file.makePublic();
        const downloadURL = file.publicUrl();

        console.log(`Successfully generated and uploaded cover for ${storyId}`);
        return downloadURL;

    } catch (error) {
        console.error(`Failed to generate or upload cover image for ${storyId}. Using placeholder.`, error);
        return 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Failed';
    }
}

interface CleanupResult {
    success: boolean;
    message: string;
    checked: number;
    updated: number;
}

/**
 * A one-time action to standardize the genres of existing stories in Firestore.
 * It matches stories to their seeds by title and updates the `subgenre` field.
 */
export async function standardizeGenresAction(): Promise<CleanupResult> {
    try {
        const db = getAdminDb();
        const storiesRef = db.collection('stories');
        const snapshot = await getDocs(storiesRef);

        if (snapshot.empty) {
            return { success: true, message: "No stories found in the database.", checked: 0, updated: 0 };
        }

        // Create a map of seed titles to their correct subgenres for quick lookup
        const seedGenreMap = new Map(storySeeds.map(seed => [seed.titleIdea, seed.subgenre]));
        
        const batch = writeBatch(db);
        let updatedCount = 0;

        snapshot.docs.forEach(doc => {
            const story = doc.data() as Story;
            const baseTitle = story.title.split(' - Part ')[0];
            const correctGenre = seedGenreMap.get(baseTitle);

            if (correctGenre && story.subgenre !== correctGenre) {
                const storyRef = db.collection('stories').doc(doc.id);
                batch.update(storyRef, { subgenre: correctGenre });
                updatedCount++;
            }
        });

        await batch.commit();

        const message = updatedCount > 0 
            ? `Successfully checked ${snapshot.size} stories and updated ${updatedCount} with standardized genres.`
            : `Checked ${snapshot.size} stories. All genres were already standard.`;

        return {
            success: true,
            message: message,
            checked: snapshot.size,
            updated: updatedCount,
        };
    } catch (error: any) {
        console.error("Error during genre standardization:", error);
        return {
            success: false,
            message: error.message || "An unknown error occurred during cleanup.",
            checked: 0,
            updated: 0,
        };
    }
}
