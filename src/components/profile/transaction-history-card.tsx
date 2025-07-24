
"use client";

import type { Purchase, UnlockedStoryInfo, Story } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gem, ShoppingCart, BookLock, History } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from "react";
import { getStoriesByIds } from "@/app/actions/storyActions.client";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

type Transaction = {
  date: string;
  type: 'purchase' | 'unlock';
  description: string;
  amount: string;
  amountColor: string;
  icon: React.ElementType;
};

interface TransactionHistoryCardProps {
  purchaseHistory: Purchase[];
  unlockedStories: UnlockedStoryInfo[];
}

export default function TransactionHistoryCard({ purchaseHistory, unlockedStories }: TransactionHistoryCardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateTransactions = async () => {
      setIsLoading(true);
      
      const purchaseTransactions: Transaction[] = (purchaseHistory || []).map(p => ({
        date: p.purchasedAt,
        type: 'purchase',
        description: `${p.coins.toLocaleString()} Coin Package`,
        amount: `+${p.coins.toLocaleString()}`,
        amountColor: "text-green-600 dark:text-green-500",
        icon: Gem
      }));

      let unlockTransactions: Transaction[] = [];
      const storyIdsToFetch = unlockedStories.map(s => s.storyId);

      if (storyIdsToFetch.length > 0) {
        const fetchedStories = await getStoriesByIds(storyIdsToFetch);
        const storiesMap = new Map(fetchedStories.map(s => [s.storyId, s]));

        unlockTransactions = unlockedStories.map(unlocked => {
          const story = storiesMap.get(unlocked.storyId);
          return {
            date: unlocked.unlockedAt,
            type: 'unlock',
            description: story ? `Unlocked: ${story.title}` : 'Unlocked Story',
            amount: `-${story?.coinCost ?? 50}`,
            amountColor: "text-red-600 dark:text-red-500",
            icon: BookLock
          };
        });
      }

      const allTransactions = [...purchaseTransactions, ...unlockTransactions];
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
      setIsLoading(false);
    };

    generateTransactions();
  }, [purchaseHistory, unlockedStories]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
            <History className="w-5 h-5 mr-2 text-primary" />
            Transaction History
        </CardTitle>
        <CardDescription>A complete ledger of your coin purchases and story unlocks.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : transactions.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Coins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        <item.icon className="w-4 h-4 mr-2.5 text-muted-foreground" />
                        <span>{item.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${item.amountColor}`}>
                        {item.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="w-full text-center py-8 col-span-full space-y-3">
            <div className="mx-auto bg-secondary rounded-full p-4 w-fit">
                <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-semibold tracking-tight">No Transactions Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                   You have no coin purchases or story unlocks yet.
                </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

