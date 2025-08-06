
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Saves user feedback to the Firestore database.
 * This is a secure server action.
 * @param feedbackText The text of the feedback.
 * @param userId The UID of the user submitting the feedback (optional).
 * @returns An object indicating success or failure.
 */
export async function saveFeedbackAction(
  feedbackText: string,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!feedbackText || feedbackText.trim().length < 10) {
    return { success: false, error: 'Feedback must be at least 10 characters long.' };
  }
   if (feedbackText.trim().length > 2000) {
    return { success: false, error: 'Feedback cannot exceed 2000 characters.' };
  }


  try {
    const db = getAdminDb();
    const feedbackRef = db.collection('feedback').doc();

    await feedbackRef.set({
      text: feedbackText,
      submittedAt: FieldValue.serverTimestamp(),
      userId: userId || 'anonymous', // Store user ID or 'anonymous'
      status: 'new', // Default status
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    return { success: false, error: 'Could not save feedback. Please try again later.' };
  }
}
