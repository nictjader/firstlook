
'use server';
/**
 * @fileOverview This file defines the AI flow for generating romance stories.
 * It uses Genkit to structure the generation process, from taking a creative
 * seed to outputting a complete, well-formatted story.
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  type Story, 
  type Subgenre,
  type StoryGenerationOutput,
} from '../../lib/types';
import { ai } from '..';
import { type StorySeed } from '../../lib/story-seeds';


// Schemas specific to this story generation flow.
// By keeping them in this server-only file, we prevent them from being
// accidentally bundled in client-side code, which was causing build failures.

const StoryGenerationInputSchema = z.object({
  titleIdea: z.string(),
  subgenre: z.string(),
  mainCharacters: z.string(),
  characterNames: z.array(z.string()),
  plotSynopsis: z.string(),
  keyTropes: z.array(z.string()),
  desiredTone: z.string(),
  approxWordCount: z.number(),
  coverImagePrompt: z.string(),
});

// This Zod schema defines the structure we expect the AI to return for a story.
const AIStoryResponseSchema = z.object({
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
      `The number of coins required to unlock the story. Should be 0 for free standalone stories and for the first part of a series. For all other premium content (subsequent parts of a series or premium standalone stories), it must be exactly 50.`
    ),
  content: z
    .string()
    .describe(
      'The full story content in well-formatted HTML, including <p>, <h2>, and <h3> tags for paragraphs and section breaks. The story should be engaging, romantic, and follow the provided plot synopsis. The approximate word count should be {{approxWordCount}} words.'
    ),
  synopsis: z
    .string()
    .describe(
      'A short, enticing summary of the generated story (around 2-3 sentences) to attract readers. This should accurately reflect the final story content.'
    ),
  subgenre: z
    .string()
    .describe(
      'The subgenre of the story, consistent with the provided seed (e.g., "contemporary", "historical", "paranormal").'
    ),
  wordCount: z.number().describe('The total word count of the generated story content.'),
  author: z.string().describe('A plausible-sounding, fictional author name for the story.'),
  status: z.enum(['published', 'failed']).describe("Set to 'published' on success."),
});

// Define a new input schema for the prompt that includes the potentialSeriesId
const StoryPromptInputSchema = StoryGenerationInputSchema.extend({
  potentialSeriesId: z.string(),
});


// Create a dedicated prompt object for story generation.
const storyGenerationPrompt = ai.definePrompt({
  name: 'storyGenerationPrompt',
  input: { schema: StoryPromptInputSchema },
  output: { schema: AIStoryResponseSchema },
  prompt: `
    You are an expert romance novelist. Your task is to write a complete, compelling, and satisfying short romance story based on the provided seed.

    **Story Seed:**
    - **Title Idea:** {{{titleIdea}}}
    - **Subgenre:** {{{subgenre}}}
    - **Main Characters:** {{{mainCharacters}}}
    - **Character Names to Use:** {{#each characterNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    - **Plot Synopsis:** {{{plotSynopsis}}}
    - **Key Tropes:** {{#each keyTropes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    - **Desired Tone:** {{{desiredTone}}}
    - **Approximate Word Count:** {{{approxWordCount}}}

    **Important Instructions:**
    1.  **Originality & Completeness:** The story must be original and have a satisfying romantic conclusion.
    2.  **Formatting:** The story content MUST be in HTML format (using <p>, <h2>, etc.).
    3.  **Synopsis:** After writing the story, you MUST generate a new, short (2-3 sentence) synopsis that accurately summarizes the story you just wrote. This will be used as the story's description.
    4.  **Series Logic:**
        - Most stories should be standalone.
        - **If and only if** you create a multi-part series (e.g., a two-part story), you MUST use this exact pre-defined ID for the 'seriesId' field for ALL parts of the series: \`{{{potentialSeriesId}}}\`.
        - For standalone stories, the 'seriesId', 'seriesTitle', 'partNumber', and 'totalPartsInSeries' fields MUST all be null.
    5.  **Monetization Logic:**
        - A standalone story can be free (coinCost: 0) or premium (coinCost: 50).
        - For a series, Part 1 MUST be free (coinCost: 0). Subsequent parts MUST cost exactly 50 coins.
    6.  **Output Format:** You MUST return the output in the specified JSON format. Do not deviate from the schema.

    Now, write the story.
  `,
  config: {
    model: 'googleai/gemini-1.5-flash-preview',
    temperature: 1.0,
  },
});


const storyGenerationFlow = ai.defineFlow(
  {
    name: 'storyGenerationFlow',
    inputSchema: StoryGenerationInputSchema,
    outputSchema: z.custom<StoryGenerationOutput>(),
  },
  async (seed) => {
    const storyId = uuidv4();
    const potentialSeriesId = uuidv4(); 

    try {
      const { output } = await storyGenerationPrompt({
        ...seed,
        potentialSeriesId,
      });

      if (!output) {
        throw new Error('AI failed to generate a story.');
      }
      
      const isSeriesStory = !!output.seriesId && output.partNumber !== null;
      
      const storyData: Omit<Story, 'publishedAt' | 'coverImageUrl'> = {
        storyId: storyId,
        title: output.title,
        characterNames: output.characterNames,
        isPremium: (output.coinCost ?? 0) > 0,
        coinCost: output.coinCost,
        content: output.content,
        synopsis: output.synopsis,
        subgenre: output.subgenre as Subgenre,
        wordCount: output.wordCount,
        author: output.author,
        status: 'published',
        coverImagePrompt: seed.coverImagePrompt,
        seriesId: isSeriesStory ? output.seriesId || undefined : undefined,
        seriesTitle: isSeriesStory ? output.seriesTitle ?? undefined : undefined,
        partNumber: isSeriesStory ? output.partNumber ?? undefined : undefined,
        totalPartsInSeries: isSeriesStory ? output.totalPartsInSeries ?? undefined : undefined,
      };

      return {
        storyId,
        title: output.title,
        success: true,
        error: null,
        storyData: storyData,
      };
    } catch (e: any) {
      console.error('Error in generateStory:', e);
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
  seed: StorySeed
): Promise<StoryGenerationOutput> {
  return storyGenerationFlow(seed);
}
