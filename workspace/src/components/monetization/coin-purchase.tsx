
'use client';

import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { useAuth } from '../../contexts/auth-context';
import { COIN_PACKAGES } from '../../lib/config';
import { cn } from '../../lib/utils';
import { Check, Coins, Loader2, Star, Trophy, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

function CoinPurchaseContent() {
  const { loading: authLoading } = useAuth();
  const { toast } = useToast();

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
    <div className="space-y-6">
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Feature Coming Soon</AlertTitle>
        <AlertDescription>
          Coin purchasing is currently disabled. We're working on bringing this feature back online.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COIN_PACKAGES.map((pkg) => {
          const labelInfo = getLabelInfo(pkg.label);
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
                  <Coins className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
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
                      onClick={() => {
                        toast({
                            title: "Purchasing Disabled",
                            description: "This feature is not currently available.",
                            variant: "destructive",
                        });
                      }}
                      disabled={true}
                  >
                      <Check className="mr-2 h-5 w-5" />
                      Purchase
                  </Button>
              </CardFooter>
              </Card>
          );
        })}
      </div>
    </div>
  );
}


export default function CoinPurchase() {
    return (
        <CoinPurchaseContent />
    );
}
