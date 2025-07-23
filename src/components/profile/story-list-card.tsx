
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import type { Story } from "@/lib/types";
import { docToStory } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { BookOpen, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface StoryListCardProps {
  title: string;
  storyIds: string[];
  icon: LucideIcon;
  emptyMessage: string;
}

async function getStoriesByIds(storyIds: string[]): Promise<Story[]> {
  if (!storyIds || storyIds.length === 0) {
    return [];
  }
  const stories: Story[] = [];

  const MAX_IDS_PER_QUERY = 30;
  for (let i = 0; i < storyIds.length; i += MAX_IDS_PER_QUERY) {
    const batchIds = storyIds.slice(i, i + MAX_IDS_PER_QUERY);
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where(documentId(), 'in', batchIds));
    const querySnapshot = await getDocs(q);
    const batchStories = querySnapshot.docs.map(doc => docToStory(doc as QueryDocumentSnapshot));
    stories.push(...batchStories);
  }

  const storyMap = new Map(stories.map(s => [s.storyId, s]));
  const orderedStories = storyIds.map(id => storyMap.get(id)).filter((s): s is Story => !!s);

  return orderedStories;
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
          <p className="text-muted-foreground text-center py-4">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

    