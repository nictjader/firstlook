
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
  const snapshot = await storiesRef.get();
  const existingTitles = snapshot.docs.map(doc => doc.data().title);
  const usedSeeds = new Set(existingTitles);
  
  const unusedSeeds = storySeeds.filter(seed => !usedSeeds.has(seed.titleIdea));

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
        const baseTitle = story.title.split(' - Chapter ')[0].split(' - Part ')[0].trim();
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
    
    // --- New, Corrected Logic ---
    const storyConceptMap = new Map<string, { count: number, type: 'series' | 'standalone' }>();
    const storiesPerGenre: Record<string, number> = {};
    let totalWordCount = 0;
    let totalPaidChapters = 0;

    stories.forEach(story => {
        const conceptTitle = story.seriesTitle || story.title;
        const conceptType = story.seriesId ? 'series' : 'standalone';
        
        if (!storyConceptMap.has(conceptTitle)) {
            storyConceptMap.set(conceptTitle, { count: 0, type: conceptType });
            // Only count genre for the first chapter of a series or for a standalone story
             const genre = story.subgenre || 'uncategorized';
             storiesPerGenre[genre] = (storiesPerGenre[genre] || 0) + 1;
        }
        
        storyConceptMap.get(conceptTitle)!.count++;
        totalWordCount += story.wordCount || 0;
        if (story.isPremium && story.coinCost > 0) {
            totalPaidChapters++;
        }
    });

    const duplicateTitles: Record<string, number> = {};
    let standaloneStoriesCount = 0;
    let multiPartSeriesCount = 0;

    for (const [title, data] of storyConceptMap.entries()) {
        if (data.type === 'standalone') {
            standaloneStoriesCount++;
            if (data.count > 1) {
                duplicateTitles[title] = data.count;
            }
        } else {
            multiPartSeriesCount++;
        }
    }
    
    // Refined duplicate logic for series
    const seriesTitleToIds = new Map<string, Set<string>>();
    stories.forEach(story => {
        if (story.seriesId && story.seriesTitle) {
            if (!seriesTitleToIds.has(story.seriesTitle)) {
                seriesTitleToIds.set(story.seriesTitle, new Set());
            }
            seriesTitleToIds.get(story.seriesTitle)!.add(story.seriesId);
        }
    });

    for (const [title, ids] of seriesTitleToIds.entries()) {
        if (ids.size > 1) {
             // Find total chapters for this duplicate series title to report accurately
            const totalChaptersForTitle = stories.filter(s => s.seriesTitle === title).length;
            duplicateTitles[title] = totalChaptersForTitle;
        }
    }


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
        totalUniqueStories: storyConceptMap.size,
        standaloneStories: standaloneStoriesCount,
        multiPartSeriesCount,
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
 * Deletes a file from Firebase Storage, handling potential errors.
 * @param filePath The full path to the file in the bucket (e.g., 'story-covers/storyId.png').
 */
async function deleteStorageFile(filePath: string) {
    try {
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            console.warn('Storage bucket name not configured, skipping file deletion.');
            return;
        }
        const bucket = getStorage().bucket(bucketName);
        const file = bucket.file(filePath);
        await file.delete();
        console.log(`Successfully deleted ${filePath} from storage.`);
    } catch (error: any) {
        // It's common for files not to exist (e.g., placeholder used), so we don't treat "Not Found" as a critical error.
        if (error.code === 404) {
            console.log(`File not found in storage, skipping deletion: ${filePath}`);
        } else {
            console.error(`Failed to delete file ${filePath} from storage:`, error);
        }
    }
}


/**
 * Finds and deletes stories with duplicate titles, keeping only the most recent one.
 * This now handles standalone stories and multi-part series correctly, and also
 * deletes the associated cover images from Firebase Storage.
 */
export async function cleanupDuplicateStoriesAction(): Promise<CleanupResult> {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();
    
    if (snapshot.empty) {
        return { success: true, message: "No stories found.", checked: 0, updated: 0 };
    }

    const stories = snapshot.docs.map(doc => docToStory(doc));
    const batch = db.batch();
    const storageDeletePromises: Promise<void>[] = [];
    let processedCount = 0;

    // --- Cleanup for Standalone Stories ---
    const standaloneStories = stories.filter(s => !s.seriesId);
    const seenStandaloneTitles = new Set<string>();
    
    standaloneStories.forEach(story => {
        if (seenStandaloneTitles.has(story.title)) {
            // This is an older duplicate, mark for deletion.
            const docRef = db.collection('stories').doc(story.storyId);
            batch.delete(docRef);
            processedCount++;
            if (story.coverImageUrl && story.coverImageUrl.includes('storage.googleapis.com')) {
                const filePath = `story-covers/${story.storyId}.png`;
                storageDeletePromises.push(deleteStorageFile(filePath));
            }
        } else {
            // First time seeing this title, it's the newest, so we keep it.
            seenStandaloneTitles.add(story.title);
        }
    });

    // --- Cleanup for Series ---
    // Group all chapters by their seriesTitle
    const seriesByTitle = new Map<string, Story[]>();
    stories.forEach(story => {
        if (story.seriesId && story.seriesTitle) {
            if (!seriesByTitle.has(story.seriesTitle)) {
                seriesByTitle.set(story.seriesTitle, []);
            }
            seriesByTitle.get(story.seriesTitle)!.push(story);
        }
    });

    seriesByTitle.forEach((chapters, title) => {
        // Within each title group, find all unique series IDs
        const uniqueSeriesIds = [...new Set(chapters.map(c => c.seriesId!))];
        
        if (uniqueSeriesIds.length > 1) {
            // This series is a duplicate. Keep the one with the newest chapter.
            const masterSeriesId = chapters[0].seriesId!; // The list is already sorted by publishedAt desc.
            
            chapters.forEach(chapter => {
                if (chapter.seriesId !== masterSeriesId) {
                    // This chapter belongs to a duplicate series. Re-assign it to the master.
                    const docRef = db.collection('stories').doc(chapter.storyId);
                    batch.update(docRef, { seriesId: masterSeriesId });
                    processedCount++;
                }
            });
        }
    });

    if (processedCount > 0) {
        await batch.commit();
    }
    
    // Wait for all storage deletions to complete.
    await Promise.all(storageDeletePromises);


    const message = processedCount > 0
        ? `Successfully cleaned up ${processedCount} duplicate entries (deleted docs, covers, and re-assigned series).`
        : `No duplicate stories found to clean up.`;

    return {
        success: true,
        message: message,
        checked: snapshot.size,
        updated: processedCount,
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

    