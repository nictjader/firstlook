
"use client";

import type { UnlockedStoryInfo, Story, CoinTransaction } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookLock, History, Gem } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

type Transaction = {
  date: string;
  type: 'unlock' | 'purchase';
  description: string;
  amount: string;
  amountColor: string;
  icon: React.ElementType;
};

interface TransactionHistoryCardProps {
  unlockedStories: UnlockedStoryInfo[];
  coinPurchases: CoinTransaction[];
  storiesMap: Map<string, Story>;
  isLoading: boolean;
}

export default function TransactionHistoryCard({ unlockedStories, coinPurchases, storiesMap, isLoading }: TransactionHistoryCardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const generateTransactions = () => {
      const unlockTransactions: Transaction[] = (unlockedStories || []).map(unlocked => {
        const story = storiesMap.get(unlocked.storyId);
        return {
          date: unlocked.unlockedAt,
          type: 'unlock',
          description: story ? `Unlocked: ${story.title}` : `Unlocked Story ID: ${unlocked.storyId}`,
          amount: `-${story?.coinCost ?? '??'}`,
          amountColor: "text-red-600 dark:text-red-500",
          icon: BookLock
        };
      });

      const purchaseTransactions: Transaction[] = (coinPurchases || []).map(purchase => ({
        date: purchase.date,
        type: 'purchase',
        description: `Purchased ${purchase.coins} Coins`,
        amount: `+${purchase.coins}`,
        amountColor: 'text-green-600 dark:text-green-500',
        icon: Gem
      }));

      const allTransactions = [...unlockTransactions, ...purchaseTransactions];
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
    };

    if (!isLoading) {
      generateTransactions();
    }
  }, [unlockedStories, coinPurchases, storiesMap, isLoading]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
            <History className="w-5 h-5 mr-2 text-primary" />
            Transaction History
        </CardTitle>
        <CardDescription>A complete ledger of your coin activity.</CardDescription>
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
                  <TableHead className="text-right">Amount</TableHead>
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
                   Your coin purchases and story unlocks will appear here.
                </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
