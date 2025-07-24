
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import type { Story } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { BookOpen, ChevronRight } from "lucide-react";
import { getStoriesByIds } from "@/app/actions/storyActions.client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface StoryListCardProps {
  title: string;
  storyIds: string[];
  icon: LucideIcon;
  emptyMessage: string;
}

export default function StoryListCard({ title, storyIds, icon: Icon, emptyMessage }: StoryListCardProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoryDetails = async () => {
      if (storyIds.length > 0) {
        setIsLoading(true);
        const fetchedStories = await getStoriesByIds(storyIds);
        setStories(fetchedStories);
        setIsLoading(false);
      } else {
        setStories([]);
        setIsLoading(false);
      }
    };
    fetchStoryDetails();
  }, [storyIds]);

  return (
    <Card className="shadow-lg">
       <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
            <Icon className="w-5 h-5 mr-2 text-primary" />
            {title}
        </CardTitle>
        <CardDescription>Revisit your {title.toLowerCase()}.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-5/6 rounded-md" />
          </div>
        ) : stories.length > 0 ? (
          <div className="border rounded-lg">
            <ul className="divide-y divide-border">
              {stories.map((story) => (
                <li key={story.storyId}>
                  <Link href={`/stories/${story.storyId}`} className="group flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex-grow">
                      <p className="font-semibold text-primary group-hover:underline">{story.title}</p>
                      {story.seriesTitle && (
                         <p className="text-xs text-muted-foreground">{`Chapter ${story.partNumber} of ${story.seriesTitle}`}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground ml-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
           <div className="w-full text-center py-8 col-span-full space-y-3">
            <div className="mx-auto bg-secondary rounded-full p-4 w-fit">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-semibold tracking-tight">No {title} Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                   {emptyMessage}
                </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    
