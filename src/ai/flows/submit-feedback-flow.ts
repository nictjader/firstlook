'use server';
/**
 * @fileOverview A Genkit flow for handling user feedback submissions.
 * This flow receives feedback from the client, logs it to the server console
 * for now, and can be extended to save to a database or send notifications.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const FeedbackSchema = z.object({
  suggestion: z.string().optional().describe('User suggestion for improvement.'),
  bugReport: z.string().optional().describe('User report of a bug or issue.'),
  praise: z.string().optional().describe('User praise for the application.'),
  other: z.string().optional().describe('Any other feedback from the user.'),
});

export type FeedbackInput = z.infer<typeof FeedbackSchema>;

// This defines the main logic for handling feedback.
// For now, it just logs the feedback to the console for demonstration purposes.
// This could be replaced with logic to save to Firestore, send an email, etc.
const submitFeedbackFlow = ai.defineFlow(
  {
    name: 'submitFeedbackFlow',
    inputSchema: FeedbackSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (feedback) => {
    console.log('New feedback received:', JSON.stringify(feedback, null, 2));

    // In a real application, you would save this to a database.
    // For example:
    // const db = await getAdminDb();
    // await db.collection('feedback').add({
    //   ...feedback,
    //   receivedAt: new Date(),
    // });

    return {
      success: true,
      message: 'Feedback logged successfully.',
    };
  }
);

// This is the exported wrapper function that will be called by our server action.
export async function handleFeedbackSubmission(input: FeedbackInput): Promise<{ success: boolean, message: string }> {
  return submitFeedbackFlow(input);
}
