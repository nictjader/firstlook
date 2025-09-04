
'use server';

import { COIN_PACKAGES } from '@/lib/config';
import { getAdminDb } from '../firebase/admin';
import { FieldValue, FieldPath, type DocumentData } from 'firebase-admin/firestore';
import type { CoinTransaction, Story } from '@/lib/types';
import { docToStoryAdmin } from '@/lib/firebase/server-types';
import { resyncUserBalanceAction } from './adminActions';

/**
 * Creates a checkout session.
 * This is a placeholder as Stripe functionality has been removed.
 */
export async function createCheckoutSession(
  packageId: string,
  userId: string,
  redirectPath?: string | null,
): Promise<{ checkoutUrl?: string; error?: string }> {
  if (!userId) {
    return { error: 'User is not authenticated.' };
  }

  const coinPackage = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!coinPackage) {
    return { error: 'Invalid coin package selected.' };
  }
  
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
