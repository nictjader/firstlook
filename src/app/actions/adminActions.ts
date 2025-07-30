
'use server';

import { generateStory } from '@/ai/flows/story-generator';
import type { GeneratedStoryIdentifiers } from '@/lib/types';
import { storySeeds, type StorySeed } from '@/lib/story-seeds';
import { getAdminDb } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { ai } from '@/ai';
import { FieldValue } from 'firebase-admin/firestore';
import type { CleanupResult, Story, DatabaseMetrics, CoinPackage } from '@/lib/types';
import { extractBase64FromDataUri, capitalizeWords } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { docToStory } from '@/lib/types';
import { COIN_PACKAGES, PREMIUM_STORY_COST, PLACEHOLDER_IMAGE_URL } from '@/lib/config';

/**
 * Selects a random story seed from the predefined list, ensuring it hasn't been used.
 * @returns A randomly selected StorySeed or null if all seeds are used.
 */
async function selectUnusedSeed(): Promise<StorySeed | null> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    
    // Fetch all story titles to perform the check in memory.
    const snapshot = await storiesRef.select('title').get();
    const existingTitles = snapshot.docs.map(doc => doc.data().title);

    // Filter seeds to find which ones have not been used.
    const unusedSeeds = storySeeds.filter(seed => !existingTitles.includes(seed.titleIdea));

    if (unusedSeeds.length === 0) {
        return null; 
    }

    const randomIndex = Math.floor(Math.random() * unusedSeeds.length);
    return unusedSeeds[randomIndex];
}

/**
 * Generates a story from a seed, saves it to Firestore, and returns simple identifiers.
 * This action is self-contained to prevent client components from needing complex AI types.
 */
export async function generateStoryAI(): Promise<GeneratedStoryIdentifiers> {
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
    
    const storyDocRef = getAdminDb().collection('stories').doc(storyResult.storyId);
    await storyDocRef.set({
        ...storyResult.storyData,
        publishedAt: FieldValue.serverTimestamp(),
        coverImageUrl: '' // Will be updated by the cover image action
    });

    return {
      success: true,
      error: null,
      title: storyResult.title,
      storyId: storyResult.storyId,
      coverImagePrompt: storyResult.storyData.coverImagePrompt,
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
 * Generates a cover image using an AI model and uploads it to a public GCS bucket.
 * This version creates a publicly accessible URL without using download tokens.
 * @param storyId The ID of the story to associate the image with.
 * @param prompt The prompt for the image generation model.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export async function generateAndUploadCoverImageAction(storyId: string, prompt: string): Promise<string> {
    const db = getAdminDb();
    
    if (!prompt) {
        console.warn(`No cover image prompt for story ${storyId}. Using placeholder.`);
        const placeholder = `${PLACEHOLDER_IMAGE_URL}?text=No+Prompt`;
        await db.collection('stories').doc(storyId).update({ coverImageUrl: placeholder });
        return placeholder;
    }
    
    const fullPrompt = `A beautiful, romantic book cover illustration for a story. The style should be painterly and evocative, fitting a romance novel. The image should feature the elements described in the following prompt: "${prompt}". The image must not contain any text, words, or letters.`;

    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: fullPrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media || !media.url) {
            throw new Error('Image generation failed to return media.');
        }
        
        const { base64Data, mimeType } = extractBase64FromDataUri(media.url);
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            throw new Error("Storage bucket name not configured.");
        }
        const bucket = getStorage().bucket(bucketName);
        const imagePath = `story-covers/${storyId}.png`;
        const file = bucket.file(imagePath);

        await file.save(imageBuffer, {
          metadata: {
            contentType: mimeType || 'image/png',
          },
          // Make the file publicly readable
          public: true,
        });

        // The public URL is in a standard format
        const downloadURL = `https://storage.googleapis.com/${bucketName}/${imagePath}`;
        
        await db.collection('stories').doc(storyId).update({ coverImageUrl: downloadURL });

        console.log(`Successfully generated and uploaded cover for ${storyId}`);
        return downloadURL;

    } catch (error) {
        console.error(`Failed to generate or upload cover image for ${storyId}. Using placeholder.`, error);
        const placeholder = `${PLACEHOLDER_IMAGE_URL}?text=Image+Failed`;
        try {
            await db.collection('stories').doc(storyId).update({ coverImageUrl: placeholder });
        } catch (dbError) {
            console.error(`Failed to update story ${storyId} with placeholder URL.`, dbError);
        }
        return placeholder;
    }
}

/**
 * A one-time action to standardize the genres of existing stories in Firestore.
 * It matches stories to their seeds by title and updates the `subgenre` field.
 */
export async function standardizeGenresAction(): Promise<CleanupResult> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.get();

    if (snapshot.empty) {
        return { success: true, message: "No stories found in the database.", checked: 0, updated: 0 };
    }

    const seedGenreMap = new Map(storySeeds.map(seed => [seed.titleIdea, seed.subgenre]));
    
    const batch = db.batch();
    let updatedCount = 0;

    snapshot.docs.forEach(doc => {
        const story = doc.data() as Story;
        const baseTitle = story.title.split(' - Chapter ')[0].split(' - Part ')[0]; 
        const correctGenre = seedGenreMap.get(baseTitle);

        if (correctGenre && story.subgenre !== correctGenre) {
            const storyRef = db.collection('stories').doc(doc.id);
            batch.update(storyRef, { subgenre: correctGenre });
            updatedCount++;
        }
    });

    if(updatedCount > 0) {
        await batch.commit();
    }

    const message = updatedCount > 0 
        ? `Successfully checked ${snapshot.size} stories and updated ${updatedCount} with standardized genres.`
        : `Checked ${snapshot.size} stories. All genres were already standard.`;

    return {
        success: true,
        message: message,
        checked: snapshot.size,
        updated: updatedCount,
    };
}


/**
 * A one-time action to remove the 'tags' field from all stories in Firestore.
 */
export async function removeTagsAction(): Promise<CleanupResult> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.get();

    if (snapshot.empty) {
        return { success: true, message: "No stories found in the database.", checked: 0, updated: 0 };
    }

    const batch = db.batch();
    let updatedCount = 0;

    snapshot.docs.forEach(doc => {
        if (doc.data().tags) {
            const storyRef = db.collection('stories').doc(doc.id);
            batch.update(storyRef, { tags: FieldValue.delete() });
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        await batch.commit();
    }
    
    const message = updatedCount > 0 
        ? `Successfully checked ${snapshot.size} stories and removed the 'tags' field from ${updatedCount} of them.`
        : `Checked ${snapshot.size} stories. None had the 'tags' field.`;

    return {
        success: true,
        message: message,
        checked: snapshot.size,
        updated: updatedCount,
    };
}


/**
 * Calculates the most cost-effective way to purchase a given number of coins.
 * This is a classic dynamic programming problem (Unbounded Knapsack / Change-making problem).
 * @param totalCoinsNeeded The total number of coins to purchase.
 * @returns The minimum cost in USD.
 */
function calculateMinimumCost(totalCoinsNeeded: number): number {
    if (totalCoinsNeeded <= 0) {
        return 0;
    }

    // Sort packages by coins to handle cases where buying a larger package is cheaper.
    const sortedPackages = [...COIN_PACKAGES].sort((a, b) => a.coins - b.coins);

    // dp[i] will be storing the minimum cost to get 'i' coins.
    const dp = new Array(totalCoinsNeeded + 1).fill(Infinity);
    dp[0] = 0; // Base case: cost to get 0 coins is 0.

    for (let i = 1; i <= totalCoinsNeeded; i++) {
        for (const pkg of sortedPackages) {
            if (pkg.coins <= i) {
                // If we use this package, the cost is its price + the minimum cost for the remaining coins.
                const cost = pkg.priceUSD + dp[i - pkg.coins];
                dp[i] = Math.min(dp[i], cost);
            } else {
                // If the package provides more coins than currently needed,
                // it might still be the cheapest option.
                dp[i] = Math.min(dp[i], pkg.priceUSD);
            }
        }
    }
    
    return parseFloat(dp[totalCoinsNeeded].toFixed(2));
}


/**
 * Analyzes all stories in the database to provide clear, actionable composition and pricing metrics.
 */
export async function analyzeDatabaseAction(): Promise<DatabaseMetrics> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.get();

    const emptyMetrics: DatabaseMetrics = {
        totalChapters: 0,
        totalUniqueStories: 0,
        standaloneStories: 0,
        multiPartSeriesCount: 0,
        storiesPerGenre: {},
        totalWordCount: 0,
        totalPaidChapters: 0,
        totalCoinCost: 0,
        avgCoinCostPerPaidChapter: 0,
        paidStandaloneStories: 0,
        paidSeriesChapters: 0,
        totalValueUSD: 0,
        avgValuePerPaidChapterUSD: 0,
        duplicateTitles: {},
    };

    if (snapshot.empty) {
        return emptyMetrics;
    }

    const stories = snapshot.docs.map(doc => docToStory(doc));
    const titleCounts: Record<string, number> = {};
    
    // Composition metrics
    const storiesPerGenre: Record<string, number> = {};
    const seriesGenres = new Map<string, string>(); // seriesId -> genre
    let standaloneStoriesCount = 0;
    
    // Monetization metrics
    let totalWordCount = 0;
    let paidChaptersCount = 0;
    let paidStandaloneStories = 0;
    const seriesData = new Map<string, { paidChapters: number }>();

    stories.forEach(story => {
        const baseTitle = story.title.split(' - Chapter ')[0].split(' - Part ')[0];
        titleCounts[baseTitle] = (titleCounts[baseTitle] || 0) + 1;
        
        const genre = story.subgenre || 'uncategorized';

        totalWordCount += story.wordCount || 0;
        if (story.isPremium && story.coinCost > 0) {
            paidChaptersCount++;
        }
        
        if (story.seriesId) {
            if (!seriesGenres.has(story.seriesId)) {
                seriesGenres.set(story.seriesId, genre);
            }
            if (!seriesData.has(story.seriesId)) {
                seriesData.set(story.seriesId, { paidChapters: 0 });
            }
            if (story.isPremium && story.coinCost > 0) {
                seriesData.get(story.seriesId)!.paidChapters++;
            }
        } else {
            standaloneStoriesCount++;
            storiesPerGenre[genre] = (storiesPerGenre[genre] || 0) + 1;
            if (story.isPremium && story.coinCost > 0) {
                paidStandaloneStories++;
            }
        }
    });

    seriesGenres.forEach((genre) => {
        storiesPerGenre[genre] = (storiesPerGenre[genre] || 0) + 1;
    });

    const duplicateTitles = Object.entries(titleCounts)
      .filter(([, count]) => count > 1)
      .reduce((acc, [title, count]) => {
        acc[title] = count;
        return acc;
      }, {} as Record<string, number>);
    
    // Calculate monetization based on a standard cost to ensure consistency
    const totalCoinCost = paidChaptersCount * PREMIUM_STORY_COST;
    const avgCoinCostPerPaidChapter = paidChaptersCount > 0 ? PREMIUM_STORY_COST : 0;
    
    const multiPartSeriesCount = seriesGenres.size;
    const totalUniqueStories = standaloneStoriesCount + multiPartSeriesCount;
    const paidSeriesChapters = Array.from(seriesData.values()).reduce((acc, s) => acc + s.paidChapters, 0);
    
    const totalValueUSD = calculateMinimumCost(totalCoinCost);

    return {
        totalChapters: stories.length,
        totalUniqueStories,
        standaloneStories: standaloneStoriesCount,
        multiPartSeriesCount,
        storiesPerGenre,
        totalWordCount,
        totalPaidChapters: paidChaptersCount,
        totalCoinCost,
        avgCoinCostPerPaidChapter,
        paidStandaloneStories,
        paidSeriesChapters,
        totalValueUSD: totalValueUSD,
        avgValuePerPaidChapterUSD: paidChaptersCount > 0 ? parseFloat((totalValueUSD / paidChaptersCount).toFixed(2)) : 0,
        duplicateTitles,
    };
}


/**
 * A one-time action to standardize the coinCost of all premium stories.
 */
export async function standardizeStoryPricesAction(): Promise<CleanupResult> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.get();

    if (snapshot.empty) {
        return { success: true, message: "No stories found in the database.", checked: 0, updated: 0 };
    }

    const batch = db.batch();
    let updatedCount = 0;

    snapshot.docs.forEach(doc => {
        const story = doc.data() as Story;
        
        // Update price only for stories that are premium (cost > 0) and don't already have the new price
        if (story.isPremium && story.coinCost > 0 && story.coinCost !== PREMIUM_STORY_COST) {
            const storyRef = db.collection('stories').doc(doc.id);
            batch.update(storyRef, { coinCost: PREMIUM_STORY_COST });
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        await batch.commit();
    }
    
    const message = updatedCount > 0 
        ? `Successfully checked ${snapshot.size} stories and updated the price of ${updatedCount} premium stories to ${PREMIUM_STORY_COST} coins.`
        : `Checked ${snapshot.size} stories. All premium stories already have the standard price.`;

    return {
        success: true,
        message: message,
        checked: snapshot.size,
        updated: updatedCount,
    };
}

    