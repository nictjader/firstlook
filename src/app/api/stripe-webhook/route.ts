import { handleStripeWebhook } from '@/lib/actions/paymentActions';

/**
 * This route handler listens for incoming webhooks from Stripe.
 * It passes the request to a server action for processing.
 * This is the POST endpoint that you will provide to Stripe.
 *
 * It's crucial that the Next.js body parser is disabled for this route
 * so that we can verify the raw request body from Stripe.
 */
export async function POST(request: Request) {
  return handleStripeWebhook(request);
}
