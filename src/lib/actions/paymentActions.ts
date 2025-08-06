
'use server';

import { Stripe } from 'stripe';
import { headers } from 'next/headers';
import { COIN_PACKAGES } from '@/lib/config';
import { getAdminDb } from '../firebase/admin';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';
import type { CoinTransaction, Story } from '@/lib/types';
import { docToStory } from '@/lib/types';


// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});


// Helper function to read the raw body from a request.
async function getRawBody(request: Request): Promise<Buffer> {
  const reader = request.body!.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}


/**
 * Retrieves a Stripe Customer ID for a given user ID, creating one if it doesn't exist.
 * This is crucial for tracking a user's purchase history reliably.
 * @param userId The Firebase UID of the user.
 * @param email The user's email address.
 * @returns The Stripe Customer ID.
 */
async function getOrCreateStripeCustomerId(userId: string, email: string | null): Promise<string> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  const userData = userDoc.data();
  if (userData && userData.stripeCustomerId) {
    // Verify the customer exists in Stripe before returning
    try {
        const customer = await stripe.customers.retrieve(userData.stripeCustomerId);
        if (customer && !customer.deleted) {
            return userData.stripeCustomerId;
        }
    } catch (error) {
        // Customer not found in Stripe, so we'll create a new one.
        console.warn(`Stripe customer ID ${userData.stripeCustomerId} for user ${userId} not found in Stripe. A new one will be created.`);
    }
  }

  // If no Stripe customer ID exists or it's invalid, create one
  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: {
      firebaseUID: userId,
    },
  });

  // Save the new Stripe customer ID to the user's Firestore document
  await userRef.set({ stripeCustomerId: customer.id }, { merge: true });

  return customer.id;
}


/**
 * Creates a Stripe Checkout Session for a given coin package and user.
 * @param packageId The ID of the coin package being purchased.
 * @param userId The ID of the user making the purchase.
 * @returns An object with the checkout URL if successful, or an error message.
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

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || headers().get('origin') || 'http://localhost:3000';
    
    // On success, always redirect to the profile page to show the updated balance.
    const successUrl = `${origin}/profile?purchase_success=true`;
    
    // On cancellation, redirect back to the page the user came from, or the buy-coins page.
    const cancelUrl = redirectPath 
        ? `${origin}${redirectPath}` 
        : `${origin}/buy-coins?cancelled=true`;
        
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(userId).get();
    const userEmail = userDoc.data()?.email || null;

    const customerId = await getOrCreateStripeCustomerId(userId, userEmail);

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${coinPackage.name} - ${coinPackage.coins} Coins`,
              description: coinPackage.messaging,
            },
            unit_amount: Math.round(coinPackage.priceUSD * 100), // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      // Store the userId and coins directly in the session's metadata for the webhook
      metadata: {
        userId: userId,
        coins: coinPackage.coins.toString(),
      },
    });

    if (!session.url) {
        throw new Error('Failed to create Stripe checkout session URL.');
    }

    return { checkoutUrl: session.url };
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return { error: error.message };
  }
}

/**
 * Recalculates and sets the correct coin balance for a user.
 * This function is called by the webhook to ensure data consistency.
 * @param userId The Firebase UID of the user.
 */
async function recalibrateCoinBalance(userId: string) {
    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);
    const storiesRef = db.collection('stories');

    // 1. Get the user document
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new Error(`User with ID ${userId} not found during recalibration.`);
    }
    const userProfile = userDoc.data()!;

    // 2. Calculate total coins from all successful Stripe purchases
    const purchaseHistory = await getCoinPurchaseHistory(userId);
    const totalCoinsPurchased = purchaseHistory.reduce((acc, transaction) => acc + transaction.coins, 0);

    // 3. Calculate total coins spent on unlocking stories
    const unlockedStoryIds = (userProfile.unlockedStories || []).map((s: { storyId: string }) => s.storyId);
    let totalCoinsSpent = 0;
    
    if (unlockedStoryIds.length > 0) {
        // Firestore 'in' query is limited to 30 items. We need to fetch in chunks.
        const storyChunks: string[][] = [];
        for (let i = 0; i < unlockedStoryIds.length; i += 30) {
            storyChunks.push(unlockedStoryIds.slice(i, i + 30));
        }

        const storyDocsPromises = storyChunks.map(chunk => 
            storiesRef.where(FieldPath.documentId(), 'in', chunk).get()
        );
        
        const storySnapshots = await Promise.all(storyDocsPromises);
        
        const storiesMap = new Map<string, Story>();
        storySnapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
                const story = docToStory(doc);
                storiesMap.set(doc.id, story);
            });
        });

        unlockedStoryIds.forEach(storyId => {
            const story = storiesMap.get(storyId);
            if (story) {
                totalCoinsSpent += story.coinCost;
            }
        });
    }

    // 4. Calculate the correct final balance
    const finalBalance = totalCoinsPurchased - totalCoinsSpent;

    // 5. Update the user's balance in Firestore
    await userRef.update({ coins: finalBalance });
    console.log(`SUCCESS: Recalibrated balance for user ${userId}. New balance: ${finalBalance}`);
}


/**
 * Handles the Stripe webhook to process successful payments.
 * This function now triggers a full balance recalibration on every successful purchase.
 * @param request The incoming request from Stripe.
 * @returns A response indicating the outcome.
 */
export async function handleStripeWebhook(request: Request) {
    console.log("Stripe webhook handler invoked.");
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error('CRITICAL: Stripe signature or webhook secret is missing.');
      return new Response('Webhook Error: Missing signature or secret.', { status: 400 });
    }

    let event: Stripe.Event;
    const body = await getRawBody(request);
    
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        console.log("Stripe event signature verified successfully.");
    } catch (err: any) {
        console.error(`CRITICAL: Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        console.log("Processing 'checkout.session.completed' event.");
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.userId;

        if (!userId) {
            console.error('CRITICAL: Webhook Error: Missing userId in session metadata.', { sessionId: session.id });
            return new Response('Webhook Error: Missing required metadata.', { status: 400 });
        }

        try {
            // Instead of just incrementing, we run a full recalibration.
            await recalibrateCoinBalance(userId);
        } catch (error) {
            console.error(`CRITICAL: Failed to recalibrate user's coin balance for user ${userId}:`, error);
            // Don't return a 500 to Stripe, as it might retry a failed recalibration logic indefinitely.
            // Log the error for manual intervention.
        }
    } else {
        console.log(`Received unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}


/**
 * Fetches a user's successful coin purchase history from Stripe.
 * @param userId The Firebase UID of the user.
 * @returns An array of CoinTransaction objects.
 */
export async function getCoinPurchaseHistory(userId: string): Promise<CoinTransaction[]> {
  if (!userId) {
    return [];
  }

  try {
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    
    if (!user || !user.stripeCustomerId) {
      return [];
    }
    const stripeCustomerId = user.stripeCustomerId;

    const checkoutSessions = await stripe.checkout.sessions.list({
        customer: stripeCustomerId,
        limit: 100,
    });

    const successfulTransactions: CoinTransaction[] = [];

    const completedSessions = checkoutSessions.data.filter(session => session.payment_status === 'paid');

    for (const session of completedSessions) {
      if (session.metadata?.coins) {
            successfulTransactions.push({
              date: new Date(session.created * 1000).toISOString(),
              coins: parseInt(session.metadata.coins, 10),
              amountUSD: session.amount_total ? session.amount_total / 100 : 0,
              stripeCheckoutId: session.id,
          });
      }
    }
    
    successfulTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return successfulTransactions;

  } catch (error) {
    console.error("Failed to fetch Stripe purchase history:", error);
    return [];
  }
}
