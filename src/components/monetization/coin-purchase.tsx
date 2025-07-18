
"use client";

import type { CoinPackage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Gem, ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { processCoinPurchase } from '@/app/actions/userActions';


const coinPackages: CoinPackage[] = [
  { id: 'cp_100', coins: 100, priceUSD: 1.99, description: 'A handful of sparks' },
  { id: 'cp_275', coins: 275, priceUSD: 4.99, description: 'Unlock a few stories' },
  { id: 'cp_500', coins: 500, priceUSD: 8.99, description: 'Best Value! Dive deeper' },
  { id: 'cp_1200', coins: 1200, priceUSD: 19.99, description: 'For the avid reader' },
];

export default function CoinPurchase() {
  const { user, refreshUserProfile } = useAuth();
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
      const result = await processCoinPurchase(user.uid, pkg);
      if (result.success) {
        await refreshUserProfile(); 
        toast({
            title: "Purchase Successful!",
            description: result.message,
            variant: "success",
        });
      } else {
        toast({
            title: "Purchase Failed",
            description: result.message,
            variant: "destructive",
        });
      }
    } catch (error) {
        console.error("Purchase processing error:", error);
        toast({
            title: "An Error Occurred",
            description: "Could not complete the purchase. Please try again later.",
            variant: "destructive",
        });
    } finally {
        setLoadingPackageId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {coinPackages.map((pkg) => (
        <div key={pkg.id} className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <div className="p-6 text-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Gem className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-headline font-semibold leading-none tracking-tight">{pkg.coins} Coins</h3>
            <p className="text-base text-muted-foreground">{pkg.description}</p>
          </div>
          <div className="flex-grow flex flex-col justify-center items-center p-6">
            <p className="text-4xl font-bold text-accent mb-4">${pkg.priceUSD.toFixed(2)}</p>
          </div>
          <div className="p-6">
             <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
                  disabled={loadingPackageId === pkg.id}
                  onClick={() => handlePurchaseAttempt(pkg)}
                >
                  {loadingPackageId === pkg.id ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {loadingPackageId === pkg.id ? 'Processing...' : 'Purchase'}
              </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
