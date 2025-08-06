
'use server';

import { Stripe } from 'stripe';
import { headers } from 'next/headers';
import { COIN_PACKAGES } from '@/lib/config';
import { getAdminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { CoinTransaction } from '@/lib/types';

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
    const origin = headers().get('origin') || 'http://localhost:3000';
    
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
 * Handles the Stripe webhook to process successful payments.
 * This function is called by the API route.
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
        
        console.log("Full session object from webhook:", JSON.stringify(session, null, 2));
        
        // Directly access metadata from the session object in the event
        const userId = session.metadata?.userId;
        const coinsStr = session.metadata?.coins;

        console.log(`Extracted from metadata - UserID: ${userId}, Coins: ${coinsStr}`);

        if (!userId || !coinsStr) {
            console.error('CRITICAL: Webhook Error: Missing userId or coins in session metadata.', { userId, coins: coinsStr, sessionId: session.id });
            return new Response('Webhook Error: Missing required metadata.', { status: 400 });
        }

        try {
            const db = getAdminDb();
            const userRef = db.collection('users').doc(userId);
            
            const coinsToAdd = parseInt(coinsStr, 10);
            if (isNaN(coinsToAdd)) {
                console.error(`CRITICAL: Webhook Error: Invalid non-numeric coin value '${coinsStr}' for user ${userId}.`);
                return new Response('Webhook Error: Invalid coin value.', { status: 400 });
            }
            
            console.log(`Attempting to add ${coinsToAdd} coins to user ${userId}.`);
            await userRef.update({
                coins: FieldValue.increment(coinsToAdd)
            });
            console.log(`SUCCESS: Credited ${coinsToAdd} coins to user ${userId}.`);

        } catch (error) {
            console.error(`CRITICAL: Failed to update user's coin balance for user ${userId}:`, error);
            return new Response('Webhook Error: Failed to update user balance in database.', { status: 500 });
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
