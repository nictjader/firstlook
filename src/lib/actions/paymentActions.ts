
'use server';

import { Stripe } from 'stripe';
import { headers } from 'next/headers';
import { COIN_PACKAGES } from '@/lib/config';
import { getAdminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

/**
 * Creates a Stripe Checkout Session for a given coin package and user.
 * @param packageId The ID of the coin package being purchased.
 * @param userId The ID of the user making the purchase.
 * @returns An object with the checkout URL if successful, or an error message.
 */
export async function createCheckoutSession(packageId: string, userId: string): Promise<{ checkoutUrl?: string; error?: string }> {
  if (!userId) {
    return { error: 'User is not authenticated.' };
  }

  const coinPackage = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!coinPackage) {
    return { error: 'Invalid coin package selected.' };
  }

  const origin = headers().get('origin') || 'http://localhost:3000';

  try {
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
      success_url: `${origin}/buy-coins?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/buy-coins?cancelled=true`,
      metadata: {
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
        const body = await request.text();
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
