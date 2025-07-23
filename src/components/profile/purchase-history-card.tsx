
"use client";

import type { Purchase } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gem, ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface PurchaseHistoryCardProps {
  purchaseHistory: Purchase[];
}

export default function PurchaseHistoryCard({ purchaseHistory }: PurchaseHistoryCardProps) {
  const sortedHistory = [...(purchaseHistory || [])].sort((a, b) => {
    const timeA = new Date(a.purchasedAt).getTime();
    const timeB = new Date(b.purchasedAt).getTime();
    return timeB - timeA;
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
            Purchase History
        </CardTitle>
        <CardDescription>A record of your coin purchases.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.map((purchase, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
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
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">You have not made any purchases yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
