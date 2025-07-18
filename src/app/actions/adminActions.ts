
'use server';

import { generateStory, StoryGenerationInput } from '@/ai/flows/story-generator';
import { storySeeds } from '@/lib/story-seeds';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from '@/lib/firebase/client'; // storage uses client SDK for upload
import { getAdminDb } from '@/lib/firebase/admin';
import { ai } from '@/ai';
import { Story } from '@/lib/types';

// The output from the pure AI generation part of the action.
// The client will handle writing this to Firestore.
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

/**
 * Selects a random story seed from the predefined list.
 * @returns A randomly selected StorySeed.
 */
function selectRandomSeed(): StoryGenerationInput {
  const randomIndex = Math.floor(Math.random() * storySeeds.length);
  return storySeeds[randomIndex];
}

/**
 * Generates story text and metadata using an AI flow.
 * It does NOT write to the database. It returns the generated data to the client.
 * @returns A promise that resolves to a GenerationResult object containing the AI-generated story data.
 */
export async function generateStoryAI(): Promise<GenerationResult> {
  const seed = selectRandomSeed();

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

        const imagePath = `story-covers/${storyId}.png`;
        const storageRef = ref(storage, imagePath);

        await uploadString(storageRef, media.url, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);

        console.log(`Successfully generated and uploaded cover for ${storyId}`);
        return downloadURL;

    } catch (error) {
        console.error(`Failed to generate or upload cover image for story ${storyId}. Using placeholder.`, error);
        return 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Failed';
    }
}

/**
 * Counts the total number of documents in the 'stories' collection.
 * @returns A promise that resolves to the number of stories in the database.
 */
export async function countStoriesInDB(): Promise<number> {
  try {
    const db = getAdminDb();
    const storiesCollection = db.collection('stories');
    // Use select() with no arguments to fetch only document IDs, which is more efficient.
    const snapshot = await storiesCollection.select().get();
    // The size property of the snapshot gives the number of documents.
    return snapshot.size;
  } catch (error) {
    console.error("Error counting stories in DB:", error);
    return 0;
  }
}
