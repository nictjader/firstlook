
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const { userId, packageId, coins } = session.metadata!;
      const coinsAmount = parseInt(coins, 10);
      const priceUSD = session.amount_total! / 100;
      
      if (!userId || !packageId || isNaN(coinsAmount)) {
        throw new Error('Missing metadata for fulfillment.');
      }
      
      const db = getAdminDb();
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      const purchaseRecord = {
        packageId,
        coins: coinsAmount,
        priceUSD,
        purchasedAt: FieldValue.serverTimestamp(),
        stripeCheckoutId: session.id,
      };

      await userRef.update({
        coins: FieldValue.increment(coinsAmount),
        purchaseHistory: FieldValue.arrayUnion(purchaseRecord),
      });

      console.log(`✅ Fulfilled purchase for user ${userId}. Added ${coinsAmount} coins.`);

    } catch (error: any) {
      console.error('Error during fulfillment:', error);
      return NextResponse.json({ error: 'Fulfillment failed.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
