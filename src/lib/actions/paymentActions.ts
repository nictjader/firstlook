
'use server';

import { COIN_PACKAGES } from '@/lib/config';
import { getAdminDb } from '../firebase/admin';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';
import type { CoinTransaction, Story } from '@/lib/types';
import { docToStory } from '@/lib/types';
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
 * Handles the Stripe webhook to process successful payments.
 * This is a placeholder as Stripe functionality has been removed.
 */
export async function handleStripeWebhook(request: Request) {
    console.log("Stripe webhook received, but functionality is disabled.");
    return new Response(JSON.stringify({ received: true, message: "Stripe functionality disabled." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
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
