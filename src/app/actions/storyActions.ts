
'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import type { CoinPackage, PurchaseResult, Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';


/**
 * Fetches all stories from the database.
 * This is used for the main story list page.
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const db = getAdminDb();
    const storiesRef = db.collection('stories');
    
    // Fetch all stories, then the client-side logic will group and sort them.
    const documentSnapshots = await storiesRef.limit(200).get();
    
    if (documentSnapshots.empty) {
      return [];
    }

    const stories = documentSnapshots.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    
    return stories;
  } catch (error) {
    console.error(`Error fetching all stories:`, error);
    // Return an empty array to prevent the page from crashing.
    return [];
  }
}

/**
 * Fetches a single story by its ID.
 * @param storyId The ID of the story to fetch.
 * @returns The story object or null if not found.
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
    try {
        const db = getAdminDb();
        const storyDocRef = db.collection('stories').doc(storyId);
        const storyDoc = await storyDocRef.get();

        if (!storyDoc.exists) {
            return null;
        }

        return docToStory(storyDoc as QueryDocumentSnapshot);
    } catch (error) {
        console.error(`Error fetching story by ID ${storyId}:`, error);
        return null;
    }
}

/**
 * Fetches all parts of a series.
 * This simplified version removes the orderBy clause to avoid potential index issues
 * and sorts the results in memory.
 * @param seriesId The ID of the series to fetch parts for.
 * @returns An array of story objects belonging to the series.
 */
export async function getSeriesParts(seriesId: string): Promise<Story[]> {
    if (!seriesId) {
        return [];
    }
    
    try {
        const db = getAdminDb();
        const storiesRef = db.collection('stories');
        
        // Simple query without ordering to avoid index issues
        const q = storiesRef.where('seriesId', '==', seriesId);
        const querySnapshot = await q.get();
        
        if (querySnapshot.empty) {
            return [];
        }
        
        const stories = querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
        
        // Sort manually by partNumber
        stories.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
        
        return stories;
        
    } catch (error) {
        console.error(`Error fetching series parts for seriesId ${seriesId}:`, error);
        return [];
    }
}


// --- Monetization Actions ---

export async function processCoinPurchase(userId: string, pkg: CoinPackage): Promise<PurchaseResult> {
  if (!userId || !pkg) {
    return { success: false, message: "User ID and coin package are required." };
  }
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
  

  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return { success: false, message: "User profile not found." };
    }
  
    const currentCoins = userDoc.data()?.coins || 0;
    const newCoinBalance = currentCoins + pkg.coins;

    const purchaseRecord = {
      packageId: pkg.id,
      coins: pkg.coins,
      priceUSD: pkg.priceUSD,
      purchasedAt: FieldValue.serverTimestamp(),
    };

    await userRef.update({
      coins: newCoinBalance,
      purchaseHistory: FieldValue.arrayUnion(purchaseRecord),
    });
    
    return { 
      success: true, 
      message: `Successfully added ${pkg.coins} coins to your balance. You now have ${newCoinBalance} coins.`
    };
  } catch (error) {
    console.error("Error processing coin purchase:", error);
    return { 
      success: false, 
      message: "The purchase could not be completed due to a server error. Your account was not charged. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
