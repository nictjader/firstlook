

"use client";

import type { CoinPackage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Gem, ShoppingCart, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createCheckoutSession } from '@/lib/actions/stripeActions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { COIN_PACKAGES } from '@/lib/config';


export default function CoinPurchase() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs after a user signs in and is redirected back.
    // It automatically triggers the purchase they originally intended.
    if (!authLoading && user && userProfile) {
      const packageIdToPurchase = searchParams.get('packageId');
      if (packageIdToPurchase) {
        const pkg = COIN_PACKAGES.find(p => p.id === packageIdToPurchase);
        if (pkg) {
          handlePurchase(pkg);
          
          // Clean the URL to avoid re-triggering on refresh
          const newUrl = window.location.pathname;
          window.history.replaceState({...window.history.state, as: newUrl, url: newUrl}, '', newUrl);
        }
      }
    }
  }, [authLoading, user, userProfile, searchParams]);

  const handlePurchase = async (pkg: CoinPackage) => {
    if (!user || !userProfile) return; // Should be handled by the click handler, but for safety
    setLoadingPackageId(pkg.id);
    try {
      await createCheckoutSession(pkg, user.uid, userProfile);
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      toast({
        title: "Purchase Error",
        description: error.message || "Could not initiate the purchase. Please try again later.",
        variant: "destructive",
      });
      setLoadingPackageId(null);
    }
  };

  const handlePurchaseAttempt = (pkg: CoinPackage) => {
     if (authLoading) return; // Prevent clicks while auth is loading
     if (!user || !userProfile) {
      router.push(`/login?reason=purchase&redirect=/buy-coins&packageId=${pkg.id}`);
      return;
    }
    handlePurchase(pkg);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {COIN_PACKAGES.map((pkg) => (
        <Card key={pkg.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out relative overflow-hidden">
          {pkg.bestValue && (
            <Badge variant="accent" className="absolute top-0 right-0 m-3 flex items-center gap-1 text-sm py-1 px-3 z-10">
              <Star className="h-4 w-4" />
              Best Value
            </Badge>
          )}
          <CardHeader className="text-center bg-gradient-to-br from-primary/20 to-accent/20 py-8">
            <Gem className="h-12 w-12 text-primary mx-auto mb-3" />
            <CardTitle className="text-3xl font-headline leading-none tracking-tight">{pkg.coins.toLocaleString()} Coins</CardTitle>
            <CardDescription className="text-base">{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center items-center py-8">
            <p className="text-4xl font-bold text-accent">${pkg.priceUSD.toFixed(2)}</p>
          </CardContent>
          <CardFooter>
             <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
                  disabled={!!loadingPackageId || authLoading}
                  onClick={() => handlePurchaseAttempt(pkg)}
                >
                  {loadingPackageId === pkg.id ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : authLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {loadingPackageId === pkg.id ? 'Redirecting...' : (authLoading ? 'Loading...' : 'Purchase')}
              </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
