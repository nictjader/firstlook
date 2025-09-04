
"use client";

import type { Story } from "../../lib/types";
import { Skeleton } from "../ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import StoryCard from "../story/story-card";

interface StoryListCardProps {
  title: string;
  stories: Story[];
  isLoading: boolean;
  icon: LucideIcon;
  emptyMessage: string;
}

const StoryRowSkeleton = () => (
    <div className="flex space-x-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        ))}
    </div>
);


export default function StoryListCard({ title, stories, isLoading, icon: Icon, emptyMessage }: StoryListCardProps) {
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
          <StoryRowSkeleton />
        ) : stories.length > 0 ? (
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
                {stories.map((story) => (
                    <div key={story.storyId} className="flex-shrink-0 w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6">
                        <StoryCard story={story} />
                    </div>
                ))}
            </div>
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
