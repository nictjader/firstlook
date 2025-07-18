'use server';

import { getStoriesByIds, getStories, getStoriesWithSeriesGrouping } from '@/lib/services/storyService';
import type { CoinPackage, Story, Subgenre } from '@/lib/types';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';

const STORIES_PER_PAGE = 12;

// --- Story Actions ---

export async function getStoriesByIdsAction(storyIds: string[]): Promise<Story[]> {
  return getStoriesByIds(storyIds);
}

export async function getMoreStoriesAction(subgenre: Subgenre | 'all', cursor: string): Promise<Story[]> {
  const stories = await getStories(
    { 
      filter: { subgenre: subgenre !== 'all' ? subgenre : undefined },
      pagination: { limit: STORIES_PER_PAGE, cursor: cursor }
    }
  );
  return stories;
}

// New action for series-aware pagination
export async function getMoreStoriesWithGroupingAction(subgenre: Subgenre | 'all', offset: number): Promise<Story[]> {
  const stories = await getStoriesWithSeriesGrouping(
    { 
      filter: { subgenre: subgenre !== 'all' ? subgenre : undefined },
      pagination: { limit: STORIES_PER_PAGE, offset: offset }
    }
  );
  return stories;
}


// --- Monetization Actions ---

interface PurchaseResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function processCoinPurchase(userId: string, pkg: CoinPackage): Promise<PurchaseResult> {
  if (!userId || !pkg) {
    return { success: false, message: "User ID and coin package are required." };
  }

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return { success: false, message: "User profile not found." };
  }
  
  const currentCoins = userDoc.data().coins || 0;
  const newCoinBalance = currentCoins + pkg.coins;

  const purchaseRecord = {
    packageId: pkg.id,
    coins: pkg.coins,
    priceUSD: pkg.priceUSD,
    purchasedAt: serverTimestamp(),
  };

  try {
    await updateDoc(userRef, {
      coins: newCoinBalance,
      purchaseHistory: arrayUnion(purchaseRecord),
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
