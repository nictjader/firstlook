
'use server';

import { generateStory } from '../../ai/flows/story-generator';
import type { GeneratedStoryIdentifiers } from '../types';
import { storySeeds } from '../story-seeds';
import type { StorySeed } from '../types';
import { getAdminDb } from '../firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { ai } from '../../ai';
import { FieldValue, FieldPath, type DocumentData } from 'firebase-admin/firestore';
import type { CleanupResult, Story, DatabaseMetrics, ChapterAnalysis } from '../types';
import { extractBase64FromDataUri, capitalizeWords } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { docToStory } from '../types';
import { PREMIUM_STORY_COST, PLACEHOLDER_IMAGE_URL } from '../config';
import { chapterPricingData } from '../pricing-data';

/**
 * Selects a random story seed from the predefined list, ensuring it hasn't been used.
 * It checks against a `seedTitleIdea` field in Firestore to prevent seed reuse.
 * @returns A randomly selected StorySeed or null if all seeds are used.
 */
async function selectUnusedSeed(): Promise<StorySeed | null> {
  const db = await getAdminDb();
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
    
    const db = await getAdminDb();
    const storyDocRef = db.collection('stories').doc(storyResult.storyId);
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
    const db = await getAdminDb();
    
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
    const db = await getAdminDb();
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
        // Use the seedTitleIdea for matching now
        const correctSubgenre = seedMap.get(story.seedTitleIdea || story.title); 
        
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
    const db = await getAdminDb();
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
 * Analyzes all stories in the database to provide clear, actionable composition and pricing metrics.
 */
export async function analyzeDatabaseAction(): Promise<DatabaseMetrics> {
    const db = await getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();

    // Define a conversion rate: e.g., 100 coins = $0.99 USD
    const COINS_PER_USD = 100 / 0.99;

    const emptyMetrics: DatabaseMetrics = {
        totalChapters: 0,
        totalUniqueStories: 0,
        standaloneStories: 0,
        multiPartSeriesCount: 0,
        storiesPerGenre: {},
        totalWordCount: 0,
        avgWordCountFree: 0,
        avgWordCountPaid: 0,
        totalPaidChapters: 0,
        totalCoinCost: 0,
        avgCoinCostPerPaidChapter: 0,
        paidStandaloneStories: 0,
        paidSeriesChapters: 0,
        duplicateTitles: {},
        totalValueUSD: 0,
        avgValuePerPaidChapterUSD: 0,
    };

    if (snapshot.empty) {
        return emptyMetrics;
    }

    const allStories = snapshot.docs.map(doc => docToStory(doc));
    
    // Group all chapters by their unique story (seriesId or storyId for standalones)
    const storyGroups = new Map<string, Story[]>();
    allStories.forEach(story => {
        const groupId = story.seriesId || story.storyId;
        if (!storyGroups.has(groupId)) {
            storyGroups.set(groupId, []);
        }
        storyGroups.get(groupId)!.push(story);
    });

    // Calculate metrics based on the grouped stories
    const storiesPerGenre: Record<string, number> = {};
    let totalWordCount = 0;
    let standaloneCount = 0;
    let multiPartSeriesCount = 0;
    let totalCoinCost = 0;
    let paidStandaloneStories = 0;
    let paidSeriesChapters = 0;
    const titleCounts = new Map<string, number>();

    let totalWordCountFree = 0;
    let freeChapterCount = 0;
    let totalWordCountPaid = 0;
    let paidChapterCount = 0;

    allStories.forEach(chapter => {
      totalWordCount += chapter.wordCount || 0;
      if (chapter.isPremium && chapter.coinCost > 0) {
        paidChapterCount++;
        totalWordCountPaid += chapter.wordCount || 0;
      } else {
        freeChapterCount++;
        totalWordCountFree += chapter.wordCount || 0;
      }
    });

    storyGroups.forEach((chapters) => {
        const representativeStory = chapters[0];
        const storyTitle = representativeStory.seriesTitle || representativeStory.title;
        const genre = representativeStory.subgenre;

        titleCounts.set(storyTitle, (titleCounts.get(storyTitle) || 0) + 1);
        storiesPerGenre[genre] = (storiesPerGenre[genre] || 0) + 1;

        if (representativeStory.seriesId) {
            multiPartSeriesCount++;
        } else {
            standaloneCount++;
        }

        chapters.forEach(chapter => {
            if (chapter.isPremium && chapter.coinCost > 0) {
                totalCoinCost += chapter.coinCost;
                if (chapter.seriesId) {
                    paidSeriesChapters++;
                } else {
                    paidStandaloneStories++;
                }
            }
        });
    });

    const duplicateTitles: Record<string, number> = {};
    titleCounts.forEach((count, title) => {
        if (count > 1) {
            duplicateTitles[title] = count;
        }
    });
    
    const totalPaidChapters = paidStandaloneStories + paidSeriesChapters;
    const avgCoinCostPerPaidChapter = totalPaidChapters > 0
        ? Math.round(totalCoinCost / totalPaidChapters)
        : 0;
    
    const avgWordCountFree = freeChapterCount > 0 ? Math.round(totalWordCountFree / freeChapterCount) : 0;
    const avgWordCountPaid = paidChapterCount > 0 ? Math.round(totalWordCountPaid / paidChapterCount) : 0;

    return {
        totalChapters: allStories.length,
        totalUniqueStories: storyGroups.size,
        standaloneStories: standaloneCount,
        multiPartSeriesCount: multiPartSeriesCount,
        storiesPerGenre,
        totalWordCount,
        avgWordCountFree,
        avgWordCountPaid,
        totalPaidChapters: totalPaidChapters,
        totalCoinCost,
        avgCoinCostPerPaidChapter,
        paidStandaloneStories,
        paidSeriesChapters,
        totalValueUSD: totalCoinCost / COINS_PER_USD,
        avgValuePerPaidChapterUSD: avgCoinCostPerPaidChapter / COINS_PER_USD,
        duplicateTitles,
    };
}


/**
 * Finds and deletes stories with duplicate titles, keeping only the most recent one.
 * This is now robust enough to handle both standalone stories and multi-chapter series.
 */
export async function cleanupDuplicateStoriesAction(): Promise<CleanupResult> {
    const db = await getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();

    if (snapshot.empty) {
        return { success: true, message: "No stories found.", checked: 0, updated: 0 };
    }

    const allStories = snapshot.docs.map(doc => docToStory(doc));
    
    const storyGroups = new Map<string, Story[]>();

    allStories.forEach(story => {
        const groupId = story.seriesId || story.storyId;
        if (!storyGroups.has(groupId)) {
            storyGroups.set(groupId, []);
        }
        storyGroups.get(groupId)!.push(story);
    });

    const titleToGroupIds = new Map<string, string[]>();
    storyGroups.forEach((stories, groupId) => {
        const title = stories[0].seriesTitle || stories[0].title;
        if (!titleToGroupIds.has(title)) {
            titleToGroupIds.set(title, []);
        }
        titleToGroupIds.get(title)!.push(groupId);
    });

    const batch = db.batch();
    let deletedCount = 0;

    titleToGroupIds.forEach((groupIds) => {
        if (groupIds.length > 1) {
            let newestGroup: Story[] | null = null;
            let newestDate = new Date(0);

            groupIds.forEach(id => {
                const group = storyGroups.get(id)!;
                const groupDate = new Date(Math.max(...group.map(s => new Date(s.publishedAt).getTime())));
                if (groupDate > newestDate) {
                    newestDate = groupDate;
                    newestGroup = group;
                }
            });

            groupIds.forEach(id => {
                const group = storyGroups.get(id)!;
                if (group !== newestGroup) {
                    group.forEach(storyToDelete => {
                        const storyRef = db.collection('stories').doc(storyToDelete.storyId);
                        batch.delete(storyRef);
                        deletedCount++;
                    });
                }
            });
        }
    });

    if (deletedCount > 0) {
        await batch.commit();
    }
    
    const message = deletedCount > 0
        ? `Successfully cleaned up and deleted ${deletedCount} duplicate story documents.`
        : `No duplicate stories found to clean up.`;

    return {
        success: true,
        message: message,
        checked: snapshot.size,
        updated: deletedCount,
    };
}


export async function standardizeStoryPricesAction(): Promise<CleanupResult> {
  const db = await getAdminDb();
  const pricingMap = new Map(chapterPricingData.map(p => [p.chapterId, p.newCoinCost]));

  if (pricingMap.size === 0) {
    return { success: false, message: 'No pricing data provided. Operation cancelled.', checked: 0, updated: 0 };
  }

  const batch = db.batch();
  let updatedCount = 0;

  for (const [chapterId, newCoinCost] of pricingMap.entries()) {
    const storyRef = db.collection('stories').doc(chapterId);
    batch.update(storyRef, {
      coinCost: newCoinCost,
      isPremium: newCoinCost > 0,
    });
    updatedCount++;
  }

  await batch.commit();
  
  const message = `Successfully updated the price for ${updatedCount} chapters based on the provided pricing data.`;

  return {
    success: true,
    message,
    checked: pricingMap.size,
    updated: updatedCount,
  };
}

/**
 * Fetches and formats data for all chapters for strategic analysis.
 */
export async function getChapterAnalysisAction(): Promise<ChapterAnalysis[]> {
    const db = await getAdminDb();
    const storiesRef = db.collection('stories');
    const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();

    if (snapshot.empty) {
        return [];
    }

    const allChapters = snapshot.docs.map(doc => docToStory(doc));

    return allChapters.map(chapter => ({
        chapterId: chapter.storyId,
        storyId: chapter.seriesId || chapter.storyId,
        wordCount: chapter.wordCount,
        currentCoinCost: chapter.coinCost,
        storyType: chapter.seriesId ? 'Series' : 'Standalone',
        partNumber: chapter.partNumber,
        title: chapter.title,
        seriesTitle: chapter.seriesTitle,
        subgenre: chapter.subgenre,
    }));
}
