
"use client";

import type { CoinPackage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Gem, ShoppingCart, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createCheckoutSession } from '@/app/actions/stripeActions';
import { Badge } from '@/components/ui/badge';


const coinPackages: CoinPackage[] = [
  { id: 'cp_100', coins: 100, priceUSD: 2.49, description: 'Unlocks 2 Stories' },
  { id: 'cp_275', coins: 275, priceUSD: 5.99, description: 'Unlocks 5 Stories' },
  { id: 'cp_650', coins: 650, priceUSD: 12.99, description: 'Unlocks 13 Stories', bestValue: true },
  { id: 'cp_1500', coins: 1500, priceUSD: 24.99, description: 'Unlocks 30 Stories' },
];

export default function CoinPurchase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);

  const handlePurchaseAttempt = async (pkg: CoinPackage) => {
     if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to purchase coins.", variant: "destructive" });
      router.push('/login');
      return;
    }

    setLoadingPackageId(pkg.id);

    try {
      // This will redirect the user to Stripe Checkout
      await createCheckoutSession(pkg, user.uid);
    } catch (error: any) {
        console.error("Stripe checkout error:", error);
        toast({
            title: "Purchase Error",
            description: error.message || "Could not initiate the purchase. Please try again later.",
            variant: "destructive",
        });
        setLoadingPackageId(null);
    }
    // The loading state will persist until the page redirects.
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {coinPackages.map((pkg) => (
        <div key={pkg.id} className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out relative overflow-hidden">
          {pkg.bestValue && (
            <Badge className="absolute top-0 right-0 m-3 bg-accent text-accent-foreground flex items-center gap-1 text-sm py-1 px-3">
              <Star className="h-4 w-4" />
              Best Value
            </Badge>
          )}
          <div className="p-6 text-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Gem className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-headline font-semibold leading-none tracking-tight">{pkg.coins.toLocaleString()} Coins</h3>
            <p className="text-base text-muted-foreground">{pkg.description}</p>
          </div>
          <div className="flex-grow flex flex-col justify-center items-center p-6">
            <p className="text-4xl font-bold text-accent">${pkg.priceUSD.toFixed(2)}</p>
          </div>
          <div className="p-6">
             <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
                  disabled={!!loadingPackageId}
                  onClick={() => handlePurchaseAttempt(pkg)}
                >
                  {loadingPackageId === pkg.id ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {loadingPackageId === pkg.id ? 'Redirecting...' : 'Purchase'}
              </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
