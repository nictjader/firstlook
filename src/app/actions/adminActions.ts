
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

// Hardcode coin packages here to avoid importing a client component in a server action.
const coinPackages: CoinPackage[] = [
  { id: 'cp_100', coins: 100, priceUSD: 1.99, description: 'Unlocks 2 stories' },
  { id: 'cp_275', coins: 275, priceUSD: 4.99, description: 'Unlocks 5 stories' },
  { id: 'cp_650', coins: 650, priceUSD: 9.99, description: 'Unlocks 13 Stories', bestValue: true },
  { id: 'cp_1500', coins: 1500, priceUSD: 19.99, description: 'Unlocks 30 Stories' },
];


/**
 * Selects a random story seed from the predefined list, ensuring it hasn't been used.
 * @returns A randomly selected StorySeed or null if all seeds are used.
 */
async function selectUnusedSeed(): Promise<StorySeed | null> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    
    const q = storiesRef.select('title');
    const snapshot = await q.get();

    const existingTitles = new Set(snapshot.docs.map(doc => doc.data().title.split(' - Part ')[0]));

    const unusedSeeds = storySeeds.filter(seed => !existingTitles.has(seed.titleIdea));

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
    
    // Save the story directly to Firestore within this server action
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
 * Generates a cover image using an AI model and uploads it to Firebase Storage.
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
        
        // Update the story document with the final cover URL
        const db = getAdminDb();
        await db.collection('stories').doc(storyId).update({ coverImageUrl: downloadURL });

        console.log(`Successfully generated and uploaded cover for ${storyId}`);
        return downloadURL;

    } catch (error) {
        console.error(`Failed to generate or upload cover image for ${storyId}. Using placeholder.`, error);
        const db = getAdminDb();
        try {
            await db.collection('stories').doc(storyId).update({ coverImageUrl: 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Failed' });
        } catch (dbError) {
            console.error(`Failed to update story ${storyId} with placeholder URL.`, dbError);
        }
        return 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Image+Failed';
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
        const story = doc.data();
        if (story.tags) {
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
    const sortedPackages = [...coinPackages].sort((a, b) => a.coins - b.coins);

    // dp[i] will be storing the minimum cost to get 'i' coins.
    // Initialize with a value larger than any possible cost.
    const dp = new Array(totalCoinsNeeded + 1).fill(Infinity);

    // Base case: cost to get 0 coins is 0.
    dp[0] = 0;

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
    
    // The result could have floating point inaccuracies, so we round to 2 decimal places.
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
    };

    if (snapshot.empty) {
        return emptyMetrics;
    }

    const stories = snapshot.docs.map(doc => docToStory(doc));
    
    // Composition metrics
    const storiesPerGenre: Record<string, number> = {};
    const seriesGenres = new Map<string, string>(); // seriesId -> genre
    let standaloneStoriesCount = 0;
    
    // Monetization metrics
    let totalWordCount = 0;
    let totalCoinCost = 0;
    let paidChaptersCount = 0;
    let paidStandaloneStories = 0;
    const seriesData = new Map<string, { totalChapters: number, paidChapters: number }>();

    stories.forEach(story => {
        const genre = story.subgenre || 'uncategorized';

        // Monetization
        totalWordCount += story.wordCount || 0;
        if (story.isPremium && story.coinCost > 0) {
            totalCoinCost += story.coinCost;
            paidChaptersCount++;
        }
        
        // Composition & Monetization by type
        if (story.seriesId) {
            if (!seriesGenres.has(story.seriesId)) {
                seriesGenres.set(story.seriesId, genre);
            }
            if (!seriesData.has(story.seriesId)) {
                seriesData.set(story.seriesId, { totalChapters: 0, paidChapters: 0 });
            }
            const currentSeries = seriesData.get(story.seriesId)!;
            currentSeries.totalChapters++;
            if (story.isPremium && story.coinCost > 0) {
                currentSeries.paidChapters++;
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

    const multiPartSeriesCount = seriesGenres.size;
    const totalUniqueStories = standaloneStoriesCount + multiPartSeriesCount;
    const totalChapters = stories.length;
    const paidSeriesChapters = Array.from(seriesData.values()).reduce((acc, s) => acc + s.paidChapters, 0);
    
    const totalValueUSD = calculateMinimumCost(totalCoinCost);

    return {
        totalChapters,
        totalUniqueStories,
        standaloneStories: standaloneStoriesCount,
        multiPartSeriesCount,
        storiesPerGenre,
        totalWordCount,
        totalPaidChapters: paidChaptersCount,
        totalCoinCost,
        avgCoinCostPerPaidChapter: paidChaptersCount > 0 ? Math.round(totalCoinCost / paidChaptersCount) : 0,
        paidStandaloneStories,
        paidSeriesChapters,
        totalValueUSD: totalValueUSD,
        avgValuePerPaidChapterUSD: paidChaptersCount > 0 ? parseFloat((totalValueUSD / paidChaptersCount).toFixed(2)) : 0,
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
    const NEW_PREMIUM_PRICE = 50;

    snapshot.docs.forEach(doc => {
        const story = doc.data() as Story;
        
        // Update price only for stories that are premium (cost > 0) and don't already have the new price
        if (story.isPremium && story.coinCost > 0 && story.coinCost !== NEW_PREMIUM_PRICE) {
            const storyRef = db.collection('stories').doc(doc.id);
            batch.update(storyRef, { coinCost: NEW_PREMIUM_PRICE });
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        await batch.commit();
    }
    
    const message = updatedCount > 0 
        ? `Successfully checked ${snapshot.size} stories and updated the price of ${updatedCount} premium stories to ${NEW_PREMIUM_PRICE} coins.`
        : `Checked ${snapshot.size} stories. All premium stories already have the standard price.`;

    return {
        success: true,
        message: message,
        checked: snapshot.size,
        updated: updatedCount,
    };
}


    
