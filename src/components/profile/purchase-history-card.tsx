
"use client";

import type { Purchase } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gem, ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";

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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-xl font-headline font-semibold leading-none tracking-tight">Purchase History</h3>
            <p className="text-sm text-muted-foreground">A record of your coin purchases.</p>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
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
        ) : (
          <p className="text-muted-foreground text-center py-4">You have not made any purchases yet.</p>
        )}
      </div>
    </div>
  );
}
