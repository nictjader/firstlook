
'use server';

import type { CoinTransaction } from '../types';


/**
 * Creates a checkout session.
 * This is a placeholder as Stripe functionality has been removed.
 */
export async function createCheckoutSession(
  packageId: string,
  userId: string,
  redirectPath?: string | null,
): Promise<{ checkoutUrl?: string; error?: string }> {
  console.log(`Checkout for user ${userId} and package ${packageId} is disabled.`);
  return { error: 'Purchasing is currently disabled.' };
}

/**
 * Fetches a user's coin purchase history.
 * This is a placeholder as Stripe functionality has been removed.
 */
export async function getCoinPurchaseHistory(userId: string): Promise<CoinTransaction[]> {
  if (!userId) {
    return [];
  }
  
  console.log(`[PurchaseHistory] Fetching for user ${userId} is disabled.`);
  return [];
}
