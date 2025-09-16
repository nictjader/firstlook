'use server';

import { handleFeedbackSubmission, type FeedbackInput } from '../../ai/flows/submit-feedback-flow';
import { revalidatePath } from 'next/cache';

/**
 * Server action to handle feedback submission from the client.
 * This provides a secure bridge between the client form and the backend Genkit flow.
 */
export async function submitFeedback(feedback: FeedbackInput): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await handleFeedbackSubmission(feedback);
    if (!result.success) {
        throw new Error(result.message);
    }
    revalidatePath('/feedback'); // Optional: revalidate the page if needed
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message || 'An unknown server error occurred.' };
  }
}
