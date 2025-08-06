
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { COIN_PACKAGES } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Check, Gem, Loader2, Star, Trophy, ArrowRight, ExternalLink } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/lib/actions/paymentActions';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';


function CoinPurchaseContent() {
  const { user, loading: authLoading } = useAuth();
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      toast({
        variant: 'success',
        title: 'Purchase Successful!',
        description: 'Your coins have been added to your account. Thank you!',
      });
      // Use router.replace to remove the query params from the URL
      router.replace('/buy-coins'); 
    }

    if (searchParams.get('cancelled')) {
      toast({
        variant: 'destructive',
        title: 'Purchase Cancelled',
        description: 'Your purchase was cancelled. You have not been charged.',
      });
      router.replace('/buy-coins');
    }
  }, [searchParams, router, toast]);


  const handlePurchase = async (packageId: string) => {
    if (!user) {
        toast({
            title: "Please Sign In",
            description: "You must be signed in to purchase coins.",
            variant: "destructive",
        });
        router.push('/login?redirect=/buy-coins');
        return;
    }
    setLoadingPackageId(packageId);

    try {
        const { checkoutUrl, error } = await createCheckoutSession(packageId, user.uid);
        
        if (error || !checkoutUrl) {
            throw new Error(error || 'Failed to create checkout session.');
        }
        
        setCheckoutUrl(checkoutUrl);

    } catch (error: any) {
        toast({
            title: "Purchase Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
        });
    } finally {
      setLoadingPackageId(null);
    }
  };

  if (authLoading) {
    return (
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Loading user details...</p>
        </div>
    )
  }

  const getLabelInfo = (label: string | null) => {
    switch (label) {
        case 'Most Popular':
            return {
                text: 'Most Popular',
                bgColor: 'bg-primary',
                icon: <Star className="h-4 w-4 mr-1.5" />
            };
        case 'Best Value':
            return {
                text: 'Best Value',
                bgColor: 'bg-accent',
                icon: <Trophy className="h-4 w-4 mr-1.5" />
            };
        default:
            return null;
    }
  };

  return (
    <>
    <Dialog open={!!checkoutUrl} onOpenChange={(isOpen) => !isOpen && setCheckoutUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout Session Ready</DialogTitle>
            <DialogDescription>
              Your secure payment page is ready. Click the button below to complete your purchase with Stripe.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
             <Button asChild className="w-full h-12 text-lg">
                <a href={checkoutUrl!} target="_blank" rel="noopener noreferrer">
                  Proceed to Secure Checkout <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COIN_PACKAGES.map((pkg) => {
        const labelInfo = getLabelInfo(pkg.label);
        const isLoading = loadingPackageId === pkg.id;
        return (
            <Card key={pkg.id} className={cn(
            "flex flex-col shadow-lg transition-all duration-300 relative overflow-hidden",
            pkg.label ? "border-primary border-2 shadow-primary/20 scale-105" : "border-border"
            )}>
            {labelInfo && (
                <div className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 w-full text-center py-1.5 text-sm font-bold flex items-center justify-center",
                    `${labelInfo.bgColor} text-primary-foreground`
                )}>
                    {labelInfo.icon}
                    {labelInfo.text}
                </div>
            )}
            <CardHeader className="text-center pt-12">
                <Gem className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                <CardDescription className="text-primary text-3xl font-headline font-semibold">
                {pkg.coins.toLocaleString()} Coins
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow text-center">
                <p className="text-muted-foreground">{pkg.messaging}</p>
            </CardContent>
            <CardFooter className="flex-col items-center p-6 bg-muted/40">
                <p className="text-4xl font-bold mb-4">${pkg.priceUSD.toFixed(2)}</p>
                <Button 
                    className="w-full h-12 text-lg" 
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isLoading}
                >
                {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Check className="mr-2 h-5 w-5" />
                )}
                Purchase
                </Button>
            </CardFooter>
            </Card>
        );
      })}
    </div>
    </>
  );
}

export default function CoinPurchase() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CoinPurchaseContent />
        </Suspense>
    );
}
