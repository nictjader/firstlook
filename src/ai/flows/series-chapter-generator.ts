
'use server';
/**
 * @fileOverview This file defines an AI flow for generating a specific missing
 * chapter within an existing romance story series.
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  type Story, 
  type Subgenre,
  type StoryGenerationOutput,
} from '../../lib/types';
import { ai } from '..';

// Define the input required to generate a missing chapter.
// This includes context from the existing parts of the series.
const SeriesChapterInputSchema = z.object({
  seriesId: z.string(),
  seriesTitle: z.string(),
  subgenre: z.string(),
  mainCharacters: z.string(), // A summary of the characters
  characterNames: z.array(z.string()),
  seriesSynopsis: z.string().describe("A synopsis of the series so far, based on the existing chapters."),
  partNumberToGenerate: z.number(),
  totalPartsInSeries: z.number(),
  approxWordCount: z.number().default(2500),
  coverImagePrompt: z.string(),
  author: z.string(),
});
export type SeriesChapterInput = z.infer<typeof SeriesChapterInputSchema>;


// This Zod schema defines the structure we expect the AI to return.
const AIChapterResponseSchema = z.object({
  content: z
    .string()
    .describe(
      'The full content for Chapter {{partNumberToGenerate}} of the series "{{seriesTitle}}". The story must be a seamless continuation of the series synopsis provided. Format the content in well-formed HTML, including <p>, <h2>, and <h3> tags. The approximate word count should be {{approxWordCount}} words.'
    ),
  newSynopsis: z
    .string()
    .describe(
      'A short, enticing summary of THIS SPECIFIC CHAPTER (around 2-3 sentences) to attract readers. This should not summarize the whole series, only the chapter you just wrote.'
    ),
  newTitle: z
    .string()
    .describe(
        `A creative and romantic title for this specific chapter (Part ${'{{partNumberToGenerate}}'}). It should be consistent with the series title "{{seriesTitle}}".`
    )
});

// Create a dedicated prompt for generating a missing series chapter.
const seriesChapterGenerationPrompt = ai.definePrompt({
  name: 'seriesChapterGenerationPrompt',
  input: { schema: SeriesChapterInputSchema },
  output: { schema: AIChapterResponseSchema },
  prompt: `
    You are an expert romance novelist. Your task is to write a specific missing chapter for an existing multi-part story. You must ensure the chapter you write logically follows the provided series synopsis.

    **Series Context:**
    - **Series Title:** {{{seriesTitle}}}
    - **Subgenre:** {{{subgenre}}}
    - **Main Characters:** {{{mainCharacters}}}
    - **Character Names to Use:** {{#each characterNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    - **Synopsis of Existing Chapters:** {{{seriesSynopsis}}}

    **Your Task:**
    1.  **Write Chapter {{partNumberToGenerate}} of {{totalPartsInSeries}}**. The chapter must seamlessly continue from the synopsis. Do not repeat events from the synopsis. Create new plot developments appropriate for this part of the series.
    2.  **Generate a Title:** Create a specific title for this chapter.
    3.  **Generate a Synopsis:** Write a new, short (2-3 sentence) synopsis that ONLY summarizes the chapter you just wrote.
    4.  **Formatting:** The story content MUST be in HTML format (using <p>, <h2>, etc.).
    5.  **Word Count:** The approximate word count should be {{{approxWordCount}}} words.
    6.  **Output Format:** You MUST return the output in the specified JSON format.

    Now, write Chapter {{partNumberToGenerate}}.
  `,
  config: {
    model: 'gemini-2.5-flash',
    temperature: 0.9,
  },
});


const generateSeriesChapterFlow = ai.defineFlow(
  {
    name: 'generateSeriesChapterFlow',
    inputSchema: SeriesChapterInputSchema,
    outputSchema: z.custom<StoryGenerationOutput>(),
  },
  async (input) => {
    const newStoryId = uuidv4();
    try {
      // Call the prompt - model config is already defined in the prompt
      const { output } = await seriesChapterGenerationPrompt(input);

      if (!output) {
        throw new Error('AI failed to generate a chapter.');
      }
      
      const isPremium = input.partNumberToGenerate > 1;
      const coinCost = isPremium ? 70 : 0;

      const storyData: Omit<Story, 'publishedAt' | 'coverImageUrl'> = {
        storyId: newStoryId,
        title: output.newTitle,
        characterNames: input.characterNames,
        isPremium: isPremium,
        coinCost: coinCost,
        content: output.content,
        synopsis: output.newSynopsis,
        subgenre: input.subgenre as Subgenre,
        wordCount: Math.round((output.content.match(/\b\w+\b/g) || []).length * 1.1), // Estimate word count
        author: input.author,
        status: 'published',
        coverImagePrompt: input.coverImagePrompt,
        seriesId: input.seriesId,
        seriesTitle: input.seriesTitle,
        partNumber: input.partNumberToGenerate,
        totalPartsInSeries: input.totalPartsInSeries,
      };

      return {
        storyId: newStoryId,
        title: output.newTitle,
        success: true,
        error: null,
        storyData: storyData,
      };
    } catch (e: any) {
      console.error('Error in generateSeriesChapter:', e.message, e);
      return {
        storyId: newStoryId,
        title: `Failed Chapter ${input.partNumberToGenerate} for "${input.seriesTitle}"`,
        success: false,
        error: e.message || 'An unknown error occurred during chapter generation.',
      };
    }
  }
);

// This is the exported function that clients will call.
export async function generateMissingChapter(
  input: SeriesChapterInput
): Promise<StoryGenerationOutput> {
  return generateSeriesChapterFlow(input);
}
