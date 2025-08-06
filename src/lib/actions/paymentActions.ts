
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
 * @returns The Stripe Customer ID.
 */
async function getOrCreateStripeCustomerId(userId: string): Promise<string> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  const stripeCustomerId = userDoc.data()?.stripeCustomerId;
  if (stripeCustomerId) {
    return stripeCustomerId;
  }

  // If no Stripe customer ID exists, create one
  const customer = await stripe.customers.create({
    metadata: {
      firebaseUID: userId,
    },
  });

  // Save the new Stripe customer ID to the user's Firestore document
  await userRef.update({
    stripeCustomerId: customer.id,
  });

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
  redirectPath: string | null
): Promise<{ checkoutUrl?: string; error?: string }> {
  if (!userId) {
    return { error: 'User is not authenticated.' };
  }

  const coinPackage = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!coinPackage) {
    return { error: 'Invalid coin package selected.' };
  }

  const origin = headers().get('origin') || 'http://localhost:3000';

  // The success URL now points to the profile page to show the user their new balance.
  // The original redirect path for a story is passed along to be handled by the profile page if needed,
  // though the primary flow is now to land on the profile.
  let successUrl = `${origin}/profile?purchase_success=true`;
  if (redirectPath) {
    if (redirectPath.startsWith('/')) {
        successUrl += `&redirect=${encodeURIComponent(redirectPath)}`;
    }
  }


  try {
    const customerId = await getOrCreateStripeCustomerId(userId);

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
      cancel_url: `${origin}/buy-coins?cancelled=true`,
      customer: customerId, // Associate the checkout with the Stripe Customer
      metadata: {
        // Keep userId here for the webhook, which might not have the customer object expanded.
        userId: userId,
        packageId: packageId,
        coins: coinPackage.coins,
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
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error('Stripe signature or webhook secret is missing.');
      return new Response('Webhook Error: Missing signature or secret.', { status: 400 });
    }

    let event: Stripe.Event;
    
    try {
        // Read the raw body as a buffer
        const body = await getRawBody(request);
        // Use the raw body to construct the event
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, coins } = session.metadata || {};

        if (!userId || !coins) {
            console.error('Webhook Error: Missing metadata in session.', session);
            return new Response('Webhook Error: Missing metadata.', { status: 400 });
        }

        try {
            const db = getAdminDb();
            const userRef = db.collection('users').doc(userId);
            
            // Atomically increment the user's coin balance
            await userRef.update({
                coins: FieldValue.increment(parseInt(coins, 10))
            });

            console.log(`Successfully credited ${coins} coins to user ${userId}.`);
        } catch (error) {
            console.error(`Failed to update user's coin balance for user ${userId}:`, error);
            // You might want to add retry logic or alert for manual intervention here
            return new Response('Webhook Error: Failed to update user balance.', { status: 500 });
        }
    }

    return new Response(null, { status: 200 });
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
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      // User has never made a purchase, so no history exists.
      return [];
    }

    const paymentIntents = await stripe.paymentIntents.list({
        customer: stripeCustomerId,
        limit: 100,
    });

    const successfulTransactions: CoinTransaction[] = [];

    for (const intent of paymentIntents.data) {
        // Find the associated checkout session if available
        const checkoutSessions = await stripe.checkout.sessions.list({
            payment_intent: intent.id,
            expand: ['line_items'],
        });
        
        const session = checkoutSessions.data[0];

        if (intent.status === 'succeeded' && session && session.metadata) {
            successfulTransactions.push({
                date: new Date(intent.created * 1000).toISOString(),
                coins: parseInt(session.metadata.coins, 10) || 0,
                amountUSD: intent.amount / 100,
                stripeCheckoutId: session.id,
            });
        }
    }
    
    // Sort descending by date
    successfulTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return successfulTransactions;

  } catch (error) {
    console.error("Failed to fetch Stripe purchase history:", error);
    // Return empty array on error to prevent crashing the profile page
    return [];
  }
}
