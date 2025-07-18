
'use server';

import { generateStory, StoryGenerationInput } from '@/ai/flows/story-generator';
import { storySeeds } from '@/lib/story-seeds';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from '@/lib/firebase/client'; // storage uses client SDK for upload
import { getAdminDb } from '@/lib/firebase/admin';
import { ai } from '@/ai';

export interface GenerationResult {
  logMessage: string;
  success: boolean;
  error: string | null;
  title: string;
  storyId: string;
}

/**
 * Selects a random story seed from the predefined list.
 * This simplified function ensures a seed is always available for generation.
 * @returns A randomly selected StorySeed.
 */
function selectRandomSeed(): StoryGenerationInput {
  const randomIndex = Math.floor(Math.random() * storySeeds.length);
  return storySeeds[randomIndex];
}


/**
 * Generates a single story by selecting a random seed and invoking the generation flow.
 * This function is now more resilient, separating text and image generation.
 * @returns A promise that resolves to a GenerationResult object.
 */
export async function generateSingleStory(): Promise<GenerationResult> {
  const seed = selectRandomSeed();

  try {
    // Step 1: Generate the story text and save the initial document.
    const storyResult = await generateStory(seed);

    if (!storyResult.success || !storyResult.storyId) {
      throw new Error(storyResult.error || 'Story generation flow failed to return a story ID.');
    }

    // Step 2: Generate and upload the cover image. This is now a separate step.
    // If this fails, it will log an error and use a placeholder, but it won't
    // cause the entire operation to fail.
    await generateAndUploadCoverImage(storyResult.storyId, seed.coverImagePrompt);

    return {
      logMessage: `Successfully generated story and initiated cover image generation for: ${storyResult.title}`,
      success: true,
      error: null,
      title: storyResult.title,
      storyId: storyResult.storyId,
    };

  } catch (error: any) {
    console.error(`Critical error in generateSingleStory for seed "${seed.titleIdea}":`, error);
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
 * Updates the existing story document with the image URL or a placeholder on failure.
 * @param storyId The ID of the story to associate the image with.
 * @param prompt The prompt for the image generation model.
 */
async function generateAndUploadCoverImage(storyId: string, prompt: string): Promise<void> {
    const db = getAdminDb();
    const storyDocRef = db.collection('stories').doc(storyId);

    if (!prompt) {
        console.warn(`No cover image prompt for story ${storyId}. Using placeholder.`);
        await storyDocRef.update({ coverImageUrl: 'https://placehold.co/600x900/D87093/F9E4EB.png?text=No+Prompt' });
        return;
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

        // The 'data_url' format includes the 'data:mime/type;base64,' prefix.
        await uploadString(storageRef, media.url, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);

        await storyDocRef.update({
            coverImageUrl: downloadURL,
        });
        console.log(`Successfully generated and uploaded cover for ${storyId}`);

    } catch (error) {
        console.error(`Failed to generate or upload cover image for story ${storyId}. Using placeholder.`, error);
        await storyDocRef.update({
            coverImageUrl: 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Failed',
        });
    }
}
