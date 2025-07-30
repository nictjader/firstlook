

import CoinPurchase from '@/components/monetization/coin-purchase';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Buy Coins - Siren',
  description: 'Purchase coins to unlock premium romance stories on Siren.',
};

const PurchaseSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);


export default function BuyCoinsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-3">Get More Coins</h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Unlock captivating premium stories by purchasing coins. Choose a package that suits you!
        </p>
      </div>
      <Suspense fallback={<PurchaseSkeleton />}>
        <CoinPurchase />
      </Suspense>
      <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All payments are securely processed by Stripe.</p>
          <p>By completing your purchase, you agree to our <a href="/terms" className="underline hover:text-primary">Terms of Service</a>.</p>
      </div>
    </div>
  );
}
