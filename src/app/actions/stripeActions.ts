
'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import type { CoinPackage, UserProfile } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase/admin';
import { docToUserProfile } from '@/lib/types';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new Error('User profile not found in the database.');
    }
    
    const userProfile = docToUserProfile(userDoc.data()!, userId);

    if (userProfile.stripeCustomerId) {
        // Return existing customer ID
        return userProfile.stripeCustomerId;
    }

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
        email: userProfile.email || undefined, // Stripe allows creating customers without an email
        name: userProfile.displayName || undefined,
        metadata: {
            firebaseUID: userId,
        },
    });

    // Save the new customer ID to the user's profile in Firestore
    await userRef.update({
        stripeCustomerId: customer.id,
    });

    return customer.id;
}


export async function createCheckoutSession(pkg: CoinPackage, userId: string) {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }
  
  const checkout_url = headers().get('origin') || process.env.NEXT_PUBLIC_URL!;

  try {
    const customerId = await getOrCreateStripeCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      metadata: {
        userId: userId,
        packageId: pkg.id,
        coins: String(pkg.coins),
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
