
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
 * It checks against a `seedTitleIdea` field in Firestore to prevent seed reuse.
 * @returns A randomly selected StorySeed or null if all seeds are used.
 */
async function selectUnusedSeed(): Promise<StorySeed | null> {
  const db = getAdminDb();
  const storiesRef = db.collection('stories');
  // Query for documents that have the 'seedTitleIdea' field.
  const snapshot = await storiesRef.select('seedTitleIdea').get();
  const usedSeedTitles = new Set(snapshot.docs.map(doc => doc.data().seedTitleIdea).filter(Boolean));
  
  const unusedSeeds = storySeeds.filter(seed => !usedSeedTitles.has(seed.titleIdea));

  if (unusedSeeds.length === 0) {
    return null; // All seeds have been used
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
        coverImageUrl: '', // Will be updated by the cover image action
        seedTitleIdea: seed.titleIdea, // Tag the story with its original seed idea
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
        return { success: true, message: 'No stories found to process.', checked: 0, updated: 0 };
    }

    const batch = db.batch();
    let updatedCount = 0;
    const seedMap = new Map(storySeeds.map(seed => [seed.titleIdea, seed.subgenre]));

    snapshot.docs.forEach(doc => {
        const story = doc.data() as Story;
        const correctSubgenre = seedMap.get(story.title);
        
        if (correctSubgenre && story.subgenre !== correctSubgenre) {
            const storyRef = db.collection('stories').doc(doc.id);
            batch.update(storyRef, { subgenre: correctSubgenre });
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        await batch.commit();
    }

    const message = updatedCount > 0 
        ? `Successfully checked ${snapshot.size} stories and standardized the genre for ${updatedCount} of them.`
        : `Checked ${snapshot.size} stories. All genres were already standard.`;

    return {
        success: true,
        message,
        checked: snapshot.size,
        updated: updatedCount
    };
}


/**
 * A one-time action to remove the 'tags' field from all stories in Firestore.
 */
export async function removeTagsAction(): Promise<CleanupResult> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.where('tags', '!=', null).get();

    if (snapshot.empty) {
        return { success: true, message: 'No stories with tags found to remove.', checked: 0, updated: 0 };
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        const storyRef = db.collection('stories').doc(doc.id);
        batch.update(storyRef, {
            tags: FieldValue.delete()
        });
    });

    await batch.commit();

    return {
        success: true,
        message: `Successfully removed the 'tags' field from ${snapshot.size} stories.`,
        checked: snapshot.size,
        updated: snapshot.size,
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
    const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();

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
    
    const titles = new Map<string, number>();
    const series = new Map<string, { count: number, genre: string }>();
    const storiesPerGenre: Record<string, number> = {};
    let totalWordCount = 0;

    stories.forEach(story => {
        titles.set(story.title, (titles.get(story.title) || 0) + 1);
        totalWordCount += story.wordCount || 0;
        
        if (story.seriesId) {
            const seriesData = series.get(story.seriesId) || { count: 0, genre: story.subgenre };
            seriesData.count++;
            series.set(story.seriesId, seriesData);
        } else {
            // It's a standalone story
            storiesPerGenre[story.subgenre] = (storiesPerGenre[story.subgenre] || 0) + 1;
        }
    });

    series.forEach(s => {
        storiesPerGenre[s.genre] = (storiesPerGenre[s.genre] || 0) + 1;
    });

    const duplicateTitles: Record<string, number> = {};
    titles.forEach((count, title) => {
        if (count > 1) {
            duplicateTitles[title] = count;
        }
    });

    const totalCoinCost = stories.reduce((acc, story) => acc + (story.isPremium ? story.coinCost : 0), 0);
    const paidChapters = stories.filter(s => s.isPremium && s.coinCost > 0);
    const avgCoinCostPerPaidChapter = paidChapters.length > 0
        ? Math.round(totalCoinCost / paidChapters.length)
        : 0;

    const paidStandaloneStories = stories.filter(s => !s.seriesId && s.isPremium && s.coinCost > 0).length;
    const paidSeriesChapters = paidChapters.length - paidStandaloneStories;
    const totalValueUSD = calculateMinimumCost(totalCoinCost);

    return {
        totalChapters: stories.length,
        totalUniqueStories: (stories.length - [...titles.values()].reduce((acc, count) => acc + count -1, 0)) + series.size,
        standaloneStories: stories.filter(s => !s.seriesId).length,
        multiPartSeriesCount: series.size,
        storiesPerGenre,
        totalWordCount,
        totalPaidChapters: paidChapters.length,
        totalCoinCost,
        avgCoinCostPerPaidChapter,
        paidStandaloneStories,
        paidSeriesChapters,
        totalValueUSD: totalValueUSD,
        avgValuePerPaidChapterUSD: paidChapters.length > 0 ? parseFloat((totalValueUSD / paidChapters.length).toFixed(2)) : 0,
        duplicateTitles,
    };
}


/**
 * Finds and deletes stories with duplicate titles, keeping only the most recent one.
 */
export async function cleanupDuplicateStoriesAction(): Promise<CleanupResult> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();
    
    if (snapshot.empty) {
        return { success: true, message: "No stories found.", checked: 0, updated: 0 };
    }

    const titles = new Set<string>();
    const batch = db.batch();
    let deletedCount = 0;

    snapshot.docs.forEach(doc => {
        const story = doc.data() as Story;
        if (titles.has(story.title)) {
            // This is a duplicate, delete it
            const docRef = db.collection('stories').doc(doc.id);
            batch.delete(docRef);
            deletedCount++;
        } else {
            // First time seeing this title, keep it
            titles.add(story.title);
        }
    });

    if (deletedCount > 0) {
        await batch.commit();
    }
    
    const message = deletedCount > 0
        ? `Successfully cleaned up and deleted ${deletedCount} duplicate stories.`
        : `No duplicate stories found to clean up.`;

    return {
        success: true,
        message: message,
        checked: snapshot.size,
        updated: deletedCount,
    };
}


export async function standardizeStoryPricesAction(): Promise<CleanupResult> {
  const db = getAdminDb();
  const storiesRef = db.collection('stories');
  const snapshot = await storiesRef.get();

  if (snapshot.empty) {
    return { success: true, message: 'No stories found to process.', checked: 0, updated: 0 };
  }

  const batch = db.batch();
  let updatedCount = 0;

  snapshot.docs.forEach((doc) => {
    const story = docToStory(doc);
    let needsUpdate = false;
    let newCoinCost = story.coinCost;

    // Logic for series: Part 1 should be free, subsequent parts should be premium.
    if (story.seriesId) {
      if (story.partNumber === 1 && (story.coinCost !== 0 || story.isPremium !== false)) {
        newCoinCost = 0;
        needsUpdate = true;
      } else if (story.partNumber && story.partNumber > 1 && (story.coinCost !== PREMIUM_STORY_COST || story.isPremium !== true)) {
        newCoinCost = PREMIUM_STORY_COST;
        needsUpdate = true;
      }
    }
    // Standalone stories can be free or premium, but if premium, cost must be standard.
    else {
      if (story.isPremium && story.coinCost !== PREMIUM_STORY_COST) {
        newCoinCost = PREMIUM_STORY_COST;
        needsUpdate = true;
      }
      if (!story.isPremium && story.coinCost !== 0) {
        newCoinCost = 0;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      const storyRef = db.collection('stories').doc(doc.id);
      batch.update(storyRef, {
        coinCost: newCoinCost,
        isPremium: newCoinCost > 0,
      });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
  }
  
  const message = updatedCount > 0
    ? `Successfully checked ${snapshot.size} stories and standardized the price for ${updatedCount} of them.`
    : `Checked ${snapshot.size} stories. All prices were already standard.`;

  return {
    success: true,
    message,
    checked: snapshot.size,
    updated: updatedCount,
  };
}

    