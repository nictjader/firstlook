import { handleStripeWebhook } from '@/lib/actions/paymentActions';
import { type NextRequest } from 'next/server';

/**
 * This route handler listens for incoming webhooks from Stripe.
 * It passes the request to a server action for processing.
 * This is the POST endpoint that you will provide to Stripe.
 */
export async function POST(request: Request) {
  // The handleStripeWebhook function now handles reading the raw body.
  return handleStripeWebhook(request);
}
