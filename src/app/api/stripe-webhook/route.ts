
import { NextResponse } from 'next/server';

/**
 * This route handler is a placeholder.
 * Stripe functionality has been removed.
 */
export async function POST(request: Request) {
  return NextResponse.json({ message: "Stripe functionality is not configured." }, { status: 501 });
}
