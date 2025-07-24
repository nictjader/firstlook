
'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import type { CoinPackage } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(pkg: CoinPackage, userId: string) {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  const db = getAdminDb();
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User profile not found in the database.');
  }
  
  const userEmail = userDoc.data()?.email;
  if (!userEmail) {
    console.warn(`User ${userId} is missing an email address.`);
  }
  
  const checkout_url = headers().get('origin') || process.env.NEXT_PUBLIC_URL!;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      metadata: {
        userId: userId,
        packageId: pkg.id,
        coins: String(pkg.coins), // Stripe metadata values must be strings
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pkg.coins} Coins Package`,
              description: pkg.description,
            },
            unit_amount: Math.round(pkg.priceUSD * 100), // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${checkout_url}/profile?payment_success=true`,
      cancel_url: `${checkout_url}/buy-coins?payment_canceled=true`,
    });

    if (session.url) {
      redirect(session.url);
    } else {
        throw new Error('Failed to create Stripe session.');
    }
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new Error('Could not create checkout session. Please try again later.');
  }
}
