
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import type { Story } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface StoryListCardProps {
  title: string;
  storyIds: string[];
  icon: LucideIcon;
  emptyMessage: string;
}

function docToStory(doc: any): Story {
    const data = doc.data();
    return {
      storyId: doc.id,
      title: data.title || 'Untitled',
      characterNames: data.characterNames || [],
      seriesId: data.seriesId || undefined,
      seriesTitle: data.seriesTitle || undefined,
      partNumber: data.partNumber || undefined,
      totalPartsInSeries: data.totalPartsInSeries || undefined,
      isPremium: data.isPremium || false,
      coinCost: data.coinCost || 0,
      content: data.content || '',
      previewText: data.previewText || '',
      subgenre: data.subgenre || 'contemporary',
      wordCount: data.wordCount || 0,
      publishedAt: data.publishedAt?.toDate().toISOString() || new Date().toISOString(),
      coverImageUrl: data.coverImageUrl || '',
      coverImagePrompt: data.coverImagePrompt || '',
      author: data.author || 'Anonymous',
      tags: data.tags || [],
      status: data.status || 'published',
    };
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
    const q = query(storiesRef, where('__name__', 'in', batchIds));
    const querySnapshot = await getDocs(q);
    const batchStories = querySnapshot.docs.map(docToStory);
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
