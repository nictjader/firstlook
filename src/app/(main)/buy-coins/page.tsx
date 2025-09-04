
'use client';

import CoinPurchase from '../../../components/monetization/coin-purchase';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This page now uses Suspense to handle the client-side CoinPurchase component
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
      <Suspense fallback={<div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <CoinPurchase />
      </Suspense>
    </div>
  );
}
