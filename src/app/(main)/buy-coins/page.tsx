'use client';

import CoinPurchase from '@/components/monetization/coin-purchase';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Note: Metadata export is still supported in Client Components,
// but it's often better to move it to a Server Component parent if possible.
// For this case, it's fine.
export default function BuyCoinsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-2">
          Top Up Your Coin Balance
        </h1>
        <p className="text-muted-foreground">
          Coins are used to unlock premium stories. Choose a package below to continue your adventure.
        </p>
      </div>
      <CoinPurchase />
    </div>
  );
}
