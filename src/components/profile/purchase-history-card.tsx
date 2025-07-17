
"use client";

import type { Purchase } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gem, ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";

interface PurchaseHistoryCardProps {
  purchaseHistory: Purchase[];
}

export default function PurchaseHistoryCard({ purchaseHistory }: PurchaseHistoryCardProps) {
  // Sort history to show most recent first
  const sortedHistory = [...(purchaseHistory || [])].sort((a, b) => {
    const timeA = a.purchasedAt ? new Date(a.purchasedAt as any).getTime() : 0;
    const timeB = b.purchasedAt ? new Date(b.purchasedAt as any).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-xl font-headline">Purchase History</CardTitle>
            <CardDescription>A record of your coin purchases.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((purchase, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {purchase.purchasedAt ? new Date(purchase.purchasedAt as any).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                        <Gem className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>{purchase.coins} Coin Package</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">${purchase.priceUSD.toFixed(2)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">You have not made any purchases yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
