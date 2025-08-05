
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { COIN_PACKAGES } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Check, Gem, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function CoinPurchase() {
  const { user, loading: authLoading } = useAuth();
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handlePurchase = async (packageId: string) => {
    // For now, this button is disabled, but we can add a toast for clarity.
    toast({
        title: "Coming Soon!",
        description: "Coin purchasing is not yet enabled. Please check back later.",
        variant: "default",
    });
    return;
    
    // --- FUTURE STRIPE LOGIC ---
    // if (!user) {
    //   // Save the intended package and redirect to login
    //   const redirectUrl = `/login?redirect=/buy-coins&package=${packageId}`;
    //   router.push(redirectUrl);
    //   return;
    // }

    // setLoadingPackageId(packageId);
    // try {
    //   // This is where you would call the server action to create a checkout session
    //   // const { url } = await createCheckoutSession(packageId, user.uid);
    //   // if (url) {
    //   //   window.location.href = url; // Redirect to Stripe
    //   // } else {
    //   //   throw new Error('Could not create a checkout session.');
    //   // }
    // } catch (error: any) {
    //   toast({
    //     title: 'Purchase Failed',
    //     description: error.message || 'An unknown error occurred. Please try again.',
    //     variant: 'destructive',
    //   });
    //   setLoadingPackageId(null);
    // }
  };

  if (authLoading) {
    return (
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Loading user details...</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COIN_PACKAGES.map((pkg) => (
        <Card key={pkg.id} className={cn(
          "flex flex-col shadow-lg transition-all duration-300",
          pkg.isPopular ? "border-primary border-2 shadow-primary/20 scale-105" : "border-border"
        )}>
          {pkg.isPopular && (
            <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1 rounded-t-lg">
              Most Popular
            </div>
          )}
          <CardHeader className="text-center">
            <Gem className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
            <CardDescription className="text-primary text-3xl font-headline font-semibold">
              {pkg.coins.toLocaleString()} Coins
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow text-center">
            <p className="text-muted-foreground">{pkg.description}</p>
          </CardContent>
          <CardFooter className="flex-col items-center p-6 bg-muted/40">
            <p className="text-4xl font-bold mb-4">${pkg.price.toFixed(2)}</p>
            <Button 
                className="w-full h-12 text-lg" 
                onClick={() => handlePurchase(pkg.id)}
                disabled // This button is currently disabled
            >
              {loadingPackageId === pkg.id ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Purchase
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
