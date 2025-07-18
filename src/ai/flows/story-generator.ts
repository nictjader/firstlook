
'use server';
/**
 * @fileOverview This file defines the AI flow for generating romance stories.
 * It uses Genkit to structure the generation process, from taking a creative
 * seed to outputting a complete, well-formatted story.
 */

import { z } from 'zod';
import { StorySeed } from '@/lib/story-seeds';
import { v4 as uuidv4 } from 'uuid';
import { getAdminDb } from '@/lib/firebase/admin';
import { Story } from '@/lib/types';
import { ai } from '@/ai';
import { Timestamp } from 'firebase-admin/firestore';

// Define the input schema for the story generation flow.
export const StoryGenerationInputSchema = z.custom<StorySeed>();
export type StoryGenerationInput = z.infer<typeof StoryGenerationInputSchema>;

// Define the output schema for the story generation flow.
export const StoryGenerationOutputSchema = z.object({
  storyId: z.string().describe('The unique ID for the generated story.'),
  title: z.string().describe('The final title of the story.'),
  success: z.boolean().describe('Whether the story generation was successful.'),
  error: z.string().nullable().describe('Any error message if the generation failed.'),
});
export type StoryGenerationOutput = z.infer<typeof StoryGenerationOutputSchema>;

// This Zod schema defines the structure we expect the AI to return for a story.
const StorySchema = z.object({
  title: z
    .string()
    .describe(
      'A creative and romantic title for the story based on the seed.'
    ),
  characterNames: z
    .array(z.string())
    .describe(
      'The names of the main characters, consistent with the provided seed.'
    ),
  seriesId: z
    .string()
    .nullable()
    .describe(
      'If this story is part of a series, this MUST be the provided series ID. Otherwise, this must be null.'
    ),
  seriesTitle: z
    .string()
    .nullable()
    .describe(
      'If this story is part of a series, provide a title for the series. Otherwise, null.'
    ),
  partNumber: z
    .number()
    .nullable()
    .describe(
      'If this story is part of a series, indicate which part it is (e.g., 1, 2). Otherwise, null.'
    ),
  totalPartsInSeries: z
    .number()
    .nullable()
    .describe(
      'If this story is part of a series, the total number of parts in the series. Otherwise, null.'
    ),
  coinCost: z
    .number()
    .describe(
      'The number of coins required to unlock the story. Should be 0 for free standalone stories and for the first part of a series. For subsequent parts of a series or premium standalone stories, it should be between 50 and 100.'
    ),
  content: z
    .string()
    .describe(
      'The full story content in well-formatted HTML, including <p>, <h2>, and <h3> tags for paragraphs and section breaks. The story should be engaging, romantic, and follow the provided plot synopsis. The approximate word count should be {{seed.approxWordCount}} words.'
    ),
  previewText: z
    .string()
    .describe(
      'A short, enticing preview of the story (around 150-200 characters) to attract readers.'
    ),
  subgenre: z
    .string()
    .describe(
      'The subgenre of the story, consistent with the provided seed (e.g., "contemporary", "historical", "paranormal").'
    ),
  wordCount: z.number().describe('The total word count of the generated story content.'),
  author: z.string().describe('A plausible-sounding, fictional author name for the story.'),
  tags: z
    .array(z.string())
    .describe(
      'An array of 3-5 relevant tags or tropes for the story (e.g., "enemies-to-lovers", "fake-relationship", "slow-burn"). These should be consistent with the seed.'
    ),
  status: z.enum(['published', 'failed']).describe("Set to 'published' on success."),
});

const storyGenerationFlow = ai.defineFlow(
  {
    name: 'storyGenerationFlow',
    inputSchema: StoryGenerationInputSchema,
    outputSchema: StoryGenerationOutputSchema,
  },
  async (seed) => {
    const db = getAdminDb();
    // Each story, even a part of a series, gets its own unique storyId.
    const storyId = uuidv4();
    // A potential seriesId is created beforehand. If the AI decides to make a series,
    // it will use this ID, ensuring all parts are linked.
    const potentialSeriesId = uuidv4(); 
    const storyDocRef = db.collection('stories').doc(storyId);

    try {
      const prompt = `
        You are an expert romance novelist. Your task is to write a complete, compelling, and satisfying short romance story based on the provided seed.

        **Story Seed:**
        - **Title Idea:** ${seed.titleIdea}
        - **Subgenre:** ${seed.subgenre}
        - **Main Characters:** ${seed.mainCharacters}
        - **Character Names to Use:** ${seed.characterNames.join(', ')}
        - **Plot Synopsis:** ${seed.plotSynopsis}
        - **Key Tropes:** ${seed.keyTropes.join(', ')}
        - **Desired Tone:** ${seed.desiredTone}
        - **Approximate Word Count:** ${seed.approxWordCount}

        **Important Instructions:**
        1.  **Originality & Completeness:** The story must be original and have a satisfying romantic conclusion.
        2.  **Formatting:** The story content MUST be in HTML format (using <p>, <h2>, etc.).
        3.  **Series Logic:**
            - Most stories should be standalone.
            - **If and only if** you create a multi-part series (e.g., a two-part story), you MUST use this exact pre-defined ID for the 'seriesId' field for ALL parts of the series: \`${potentialSeriesId}\`.
            - For standalone stories, the 'seriesId', 'seriesTitle', 'partNumber', and 'totalPartsInSeries' fields MUST all be null.
        4.  **Monetization Logic:**
            - A standalone story can be free (coinCost: 0) or premium (coinCost: 50-100).
            - For a series, Part 1 MUST be free (coinCost: 0). Subsequent parts MUST be premium (coinCost: 50-100).
        5.  **Output Format:** You MUST return the output in the specified JSON format. Do not deviate from the schema.

        Now, write the story.
    `;

      const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-pro-preview',
        prompt: prompt,
        output: {
          schema: StorySchema,
        },
        config: {
          temperature: 1.0,
        },
      });

      const output = llmResponse.output;

      if (!output) {
        throw new Error('AI failed to generate a story.');
      }
      
      const isSeriesStory = output.seriesId === potentialSeriesId && output.seriesId !== null;
      
      const newStory: Omit<Story, 'storyId' | 'publishedAt'> = {
        title: output.title,
        characterNames: output.characterNames,
        isPremium: (output.coinCost ?? 0) > 0,
        coinCost: output.coinCost,
        content: output.content,
        previewText: output.previewText,
        subgenre: output.subgenre,
        wordCount: output.wordCount,
        author: output.author,
        tags: output.tags,
        status: 'published',
        coverImagePrompt: seed.coverImagePrompt,
        // Use the consistent ID if it's a series, otherwise undefined.
        seriesId: isSeriesStory ? potentialSeriesId : undefined,
        seriesTitle: isSeriesStory ? output.seriesTitle ?? undefined : undefined,
        partNumber: isSeriesStory ? output.partNumber ?? undefined : undefined,
        totalPartsInSeries: isSeriesStory ? output.totalPartsInSeries ?? undefined : undefined,
      };

      await storyDocRef.set({
        ...newStory,
        publishedAt: Timestamp.now(), // Use Admin SDK Timestamp
      });

      return {
        storyId,
        title: output.title,
        success: true,
        error: null,
      };
    } catch (e: any) {
      console.error('Error in generateStory:', e);
      const failedStory: Partial<Story> = {
        title: seed.titleIdea,
        publishedAt: Timestamp.now(),
        status: 'failed',
        content: `Failed to generate story. Error: ${e.message}`,
        coverImagePrompt: seed.coverImagePrompt,
      };
      await storyDocRef.set(failedStory, { merge: true });

      return {
        storyId: storyId,
        title: seed.titleIdea,
        success: false,
        error: e.message || 'An unknown error occurred during story generation.',
      };
    }
  }
);

// This is the exported function that clients will call.
export async function generateStory(
  seed: StoryGenerationInput
): Promise<StoryGenerationOutput> {
  return storyGenerationFlow(seed);
}
