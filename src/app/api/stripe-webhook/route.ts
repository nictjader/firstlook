
import { handleStripeWebhook } from '@/lib/actions/paymentActions';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * This route handler listens for incoming webhooks from Stripe.
 * It passes the request to a server action for processing.
 * This is the POST endpoint that you will provide to Stripe.
 */
export async function POST(request: Request) {
  return handleStripeWebhook(request);
}

// By exporting this object, we tell Next.js to disable the default body parser
// for this route. This is crucial because Stripe's signature verification
// requires the raw, unparsed request body.
export const api = {
  bodyParser: false,
};
