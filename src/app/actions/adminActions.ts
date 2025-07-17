
'use server';

import { generateStory, StoryGenerationInput } from '@/ai/flows/story-generator';
import { storySeeds } from '@/lib/story-seeds';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from '@/lib/firebase/client'; // storage uses client SDK for upload
import { getAdminDb } from '@/lib/firebase/admin';
import { ai } from '@/ai';
import { getAllStoryTitles } from '@/lib/services/storyService';

export interface GenerationResult {
  logMessage: string;
  success: boolean;
  error: string | null;
  title: string;
  storyId: string;
}

/**
 * Selects a random story seed from the predefined list that hasn't been used yet.
 * @param usedTitles A set of already used story titles.
 * @returns A randomly selected StorySeed or null if all seeds have been used.
 */
function selectRandomUnusedSeed(usedTitles: Set<string>): StoryGenerationInput | null {
  const availableSeeds = storySeeds.filter(seed => !usedTitles.has(seed.titleIdea.toLowerCase()));
  if (availableSeeds.length === 0) {
    return null; // No more unique seeds available
  }
  const randomIndex = Math.floor(Math.random() * availableSeeds.length);
  return availableSeeds[randomIndex];
}


/**
 * Generates a single story by selecting a random seed and invoking the generation flow.
 * @returns A promise that resolves to a GenerationResult object.
 */
export async function generateSingleStory(): Promise<GenerationResult> {
  const usedTitles = await getAllStoryTitles();

  const seed = selectRandomUnusedSeed(usedTitles);
  if (!seed) {
    const errorMsg = 'No unused story seeds available.';
    console.error(errorMsg);
    return {
      logMessage: `Failed: ${errorMsg}`,
      success: false,
      error: 'All available story seeds have been used.',
      title: '',
      storyId: '',
    };
  }

  try {
    const storyResult = await generateStory(seed);
    if (storyResult.success && storyResult.storyId) {
      // The image prompt is in the seed, not the document yet. Pass it directly.
      await generateAndUploadCoverImage(storyResult.storyId, seed.coverImagePrompt);

      return {
        logMessage: `Successfully generated story and cover: ${storyResult.title}`,
        success: true,
        error: null,
        title: storyResult.title,
        storyId: storyResult.storyId,
      };
    } else {
      throw new Error(storyResult.error || 'Story generation failed for an unknown reason.');
    }
  } catch (error: any) {
    console.error(`Error in generation process for seed "${seed.titleIdea}":`, error);
    return {
      logMessage: `Failed to generate story for seed: ${seed.titleIdea}`,
      success: false,
      error: error.message,
      title: seed.titleIdea,
      storyId: '',
    };
  }
}

/**
 * Generates a cover image using an AI model and uploads it to Firebase Storage.
 * This function no longer fetches the document, as the prompt is passed in directly.
 * @param storyId The ID of the story to associate the image with.
 * @param prompt The prompt for the image generation model.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
async function generateAndUploadCoverImage(storyId: string, prompt: string): Promise<string> {
    const db = getAdminDb();
    const storyDocRef = db.collection('stories').doc(storyId);

    if (!prompt) {
        console.error(`No prompt provided for story ${storyId}. Using placeholder.`);
        // Even if the prompt is missing, update the story with a placeholder so it's not left in a broken state.
        await storyDocRef.update({
            coverImageUrl: 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Prompt+Missing',
        });
        return 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Prompt+Missing';
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

        await storyDocRef.update({
            coverImageUrl: downloadURL,
        });

        return downloadURL;

    } catch (error) {
        console.error(`Failed to generate or upload cover image for story ${storyId}:`, error);
        await storyDocRef.update({
            coverImageUrl: 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Failed',
            // ensure it's still visible even if image fails
            status: 'published', 
        });
        return 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Failed';
    }
}
