
'use server';

import { generateStory } from '../../ai/flows/story-generator';
import { generateMissingChapter } from '../../ai/flows/series-chapter-generator';
import type { GeneratedStoryIdentifiers, StoryGenerationOutput } from '../types';
import { storySeeds } from '../story-seeds';
import type { StorySeed } from '../types';
import { getAdminDb } from '../firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { ai } from '../../ai';
import { FieldValue, FieldPath, type DocumentData, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { CleanupResult, Story, DatabaseMetrics, ChapterAnalysis } from '../types';
import { extractBase64FromDataUri, capitalizeWords } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { docToStory as docToStoryClient } from '../types'; // Keep client version for specific uses
import { PREMIUM_STORY_COST, PLACEHOLDER_IMAGE_URL } from '../config';
import { chapterPricingData } from '../pricing-data';


// SERVER-SIDE version of docToStory
function docToStory(doc: QueryDocumentSnapshot | DocumentData): Story {
    const data = doc.data();
    if (!data) {
      throw new Error(`Document with id ${doc.id} has no data.`);
    }

    const storyId = data.storyId || doc.id;
    const isSeriesStory = !!data.seriesId && typeof data.partNumber === 'number';

    const safeToISOString = (timestamp: any): string => {
        if (!timestamp) return new Date().toISOString();
        if (typeof timestamp.toDate === 'function') { // Firestore Admin Timestamp
            return timestamp.toDate().toISOString();
        }
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }
        if (typeof timestamp === 'string') {
            const d = new Date(timestamp);
            if (!isNaN(d.getTime())) {
              return d.toISOString();
            }
        }
        // This was causing issues with some data. A more robust fallback.
        try {
            const d = new Date(timestamp);
            if (!isNaN(d.getTime())) return d.toISOString();
        } catch (e) {
            // ignore
        }
        console.warn('Unsupported timestamp format encountered in docToStory:', timestamp);
        return new Date().toISOString();
    };

    return {
      storyId: storyId,
      title: data.title || 'Untitled',
      characterNames: data.characterNames || [],
      seriesId: isSeriesStory ? data.seriesId : undefined,
      seriesTitle: isSeriesStory ? data.seriesTitle : undefined,
      partNumber: isSeriesStory ? data.partNumber : undefined,
      totalPartsInSeries: isSeriesStory ? data.totalPartsInSeries : undefined,
      isPremium: data.isPremium || false,
      coinCost: data.coinCost || 0,
      content: data.content || '',
      synopsis: data.synopsis || data.previewText || '',
      subgenre: data.subgenre || 'contemporary',
      wordCount: data.wordCount || 0,
      publishedAt: safeToISOString(data.publishedAt),
      coverImageUrl: data.coverImageUrl || '',
      coverImagePrompt: data.coverImagePrompt || '',
      author: data.author || 'Anonymous',
      status: data.status || 'published',
      seedTitleIdea: data.seedTitleIdea,
    };
}


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
            model: 'gemini-2.5-flash-image-preview',
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
      const effectiveTitle = chapter.seriesTitle || chapter.title;
      titleCounts.set(effectiveTitle, (titleCounts.get(effectiveTitle) || 0) + 1);

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
        const genre = representativeStory.subgenre;

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
        // A series will have multiple chapters with the same seriesTitle, so we only flag duplicates if the count
        // exceeds the number of parts in that series, or if a standalone title appears more than once.
        const series = Array.from(storyGroups.values()).find(g => g[0].seriesTitle === title);
        if (series) {
            // It's a series. Is the chapter count higher than the number of parts?
            if (count > (series[0].totalPartsInSeries || 1)) {
                 duplicateTitles[title] = count;
            }
        } else {
             // It's a standalone story.
            if (count > 1) {
                duplicateTitles[title] = count;
            }
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
    
    const standaloneTitleMap = new Map<string, Story[]>();
    const seriesMap = new Map<string, Story[]>();

    allStories.forEach(story => {
        if(story.seriesId) {
            // This is a chapter of a series. Don't treat chapters of the SAME series as duplicates.
            if(!seriesMap.has(story.seriesId)) {
                seriesMap.set(story.seriesId, []);
            }
            seriesMap.get(story.seriesId)!.push(story);
        } else {
            // This is a standalone story. Group by title to find duplicates.
            const title = story.seedTitleIdea || story.title;
             if(!standaloneTitleMap.has(title)) {
                standaloneTitleMap.set(title, []);
            }
            standaloneTitleMap.get(title)!.push(story);
        }
    });

    const batch = db.batch();
    let deletedCount = 0;

    // Handle duplicate standalone stories
    standaloneTitleMap.forEach((stories) => {
        if (stories.length > 1) {
            // The stories are already sorted by `publishedAt` descending.
            // Keep the first one (most recent), delete the rest.
            stories.slice(1).forEach(story => {
                const storyRef = db.collection('stories').doc(story.storyId);
                batch.delete(storyRef);
                deletedCount++;
            });
        }
    });

    // Handle duplicate series (multiple series with the same title)
    const seriesByTitle = new Map<string, Story[][]>();
    seriesMap.forEach(chapters => {
        const title = chapters[0].seriesTitle || chapters[0].title;
        if (!seriesByTitle.has(title)) {
            seriesByTitle.set(title, []);
        }
        seriesByTitle.get(title)!.push(chapters);
    });

    seriesByTitle.forEach((seriesInstances) => {
        if (seriesInstances.length > 1) {
            // Sort instances by the most recent chapter within them
            seriesInstances.sort((a, b) => {
                const mostRecentA = Math.max(...a.map(c => new Date(c.publishedAt).getTime()));
                const mostRecentB = Math.max(...b.map(c => new Date(c.publishedAt).getTime()));
                return mostRecentB - mostRecentA;
            });

            // Keep the first instance (the most recent series), delete all chapters from other instances
            seriesInstances.slice(1).forEach(instance => {
                instance.forEach(chapter => {
                    const storyRef = db.collection('stories').doc(chapter.storyId);
                    batch.delete(storyRef);
                    deletedCount++;
                });
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


/**
 * Finds and regenerates missing chapters for all series in the database.
 */
export async function regenerateMissingChaptersAction(): Promise<StoryGenerationOutput[]> {
  const db = await getAdminDb();
  const storiesRef = db.collection('stories');
  const snapshot = await storiesRef.get();
  
  if (snapshot.empty) {
    return [];
  }

  const allStories = snapshot.docs.map(docToStory);
  const seriesMap = new Map<string, Story[]>();

  // Group stories by seriesId
  allStories.forEach(story => {
    if (story.seriesId) {
      if (!seriesMap.has(story.seriesId)) {
        seriesMap.set(story.seriesId, []);
      }
      seriesMap.get(story.seriesId)!.push(story);
    }
  });

  const regenerationPromises: Promise<StoryGenerationOutput>[] = [];

  // Identify and queue regeneration for missing chapters
  seriesMap.forEach(chapters => {
    const totalParts = chapters[0]?.totalPartsInSeries;
    if (!totalParts || chapters.length >= totalParts) {
      return; // Series is complete or data is invalid
    }

    const existingPartNumbers = new Set(chapters.map(c => c.partNumber));
    const representativeChapter = chapters[0];

    for (let i = 1; i <= totalParts; i++) {
      if (!existingPartNumbers.has(i)) {
        console.log(`Queueing regeneration for ${representativeChapter.seriesTitle}, Part ${i}`);
        
        // Collate existing content into a synopsis for the AI
        const seriesSynopsis = chapters
          .sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0))
          .map(c => `Synopsis for Part ${c.partNumber}: ${c.synopsis}`)
          .join('\n');

        const generationInput = {
          seriesId: representativeChapter.seriesId!,
          seriesTitle: representativeChapter.seriesTitle!,
          subgenre: representativeChapter.subgenre,
          mainCharacters: `The main characters are ${representativeChapter.characterNames?.join(' and ')}.`,
          characterNames: representativeChapter.characterNames || [],
          seriesSynopsis: seriesSynopsis,
          partNumberToGenerate: i,
          totalPartsInSeries: totalParts,
          coverImagePrompt: representativeChapter.coverImagePrompt,
          author: representativeChapter.author || 'FirstLook AI',
        };

        regenerationPromises.push(
          generateMissingChapter(generationInput).then(async (result) => {
            if (result.success && result.storyData) {
              const storyDocRef = db.collection('stories').doc(result.storyId);
              await storyDocRef.set({
                  ...result.storyData,
                  publishedAt: FieldValue.serverTimestamp(),
                  coverImageUrl: representativeChapter.coverImageUrl || '' // Use existing cover
              });
            }
            return result;
          })
        );
      }
    }
  });

  if (regenerationPromises.length === 0) {
      return [];
  }

  return Promise.all(regenerationPromises);
}

    

    