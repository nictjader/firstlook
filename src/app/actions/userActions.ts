
'use server';

import { getAdminDb } from '@/lib/firebase/admin';

/**
 * Resets a user's account to a clean state.
 * This is useful for clearing out buggy data from development.
 * @param userId The ID of the user to reset.
 */
export async function resetUserAccountAction(userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) {
    throw new Error('User ID is required to reset an account.');
  }

  try {
    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);

    // Atomically update the user's document
    await userRef.update({
      coins: 250, // A fresh start with a generous coin balance
      unlockedStories: [],
      readStories: [],
      favoriteStories: [],
      purchaseHistory: [],
    });

    console.log(`Successfully reset account for user ${userId}`);
    return {
      success: true,
      message: `User ${userId} has been successfully reset.`,
    };
  } catch (error: any) {
    console.error(`Failed to reset account for user ${userId}:`, error);
    throw new Error('An unexpected error occurred while resetting the account.');
  }
}
