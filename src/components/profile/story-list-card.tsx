
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import type { Story } from "@/lib/types";
import { getStoriesByIdsAction } from "@/app/actions/userActions";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";

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
        const fetchedStories = await getStoriesByIdsAction(storyIds);
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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-xl font-headline font-semibold leading-none tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">Revisit your {title.toLowerCase()}.</p>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        ) : stories.length > 0 ? (
          <ul className="space-y-3">
            {stories.map((story, index) => (
              <li key={story.storyId}>
                <Link href={`/stories/${story.storyId}`} className="group flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors">
                  <div className="flex-grow">
                    <p className="font-semibold text-primary group-hover:underline">{story.title}</p>
                    {story.seriesTitle && (
                       <p className="text-xs text-muted-foreground">{`Part ${story.partNumber} of ${story.seriesTitle}`}</p>
                    )}
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground ml-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                {index < stories.length - 1 && <Separator />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
