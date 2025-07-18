
"use client";

import ReaderView from '@/components/story/reader-view';
import { notFound, useParams } from 'next/navigation';
import type { Story } from '@/lib/types';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { docToStory } from '@/lib/types';


export default function StoryPage() {
    const params = useParams();
    const storyId = params.storyId as string;

    const [story, setStory] = useState<Story | null>(null);
    const [seriesParts, setSeriesParts] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!storyId) return;

        const fetchStory = async () => {
            setLoading(true);
            const storyDocRef = doc(db, 'stories', storyId);
            const storyDoc = await getDoc(storyDocRef);

            if (!storyDoc.exists()) {
                notFound();
                return;
            }

            const storyData = docToStory(storyDoc);
            setStory(storyData);

            if (storyData.seriesId) {
                const storiesRef = collection(db, 'stories');
                const q = query(storiesRef, where('seriesId', '==', storyData.seriesId), orderBy('partNumber', 'asc'));
                const querySnapshot = await getDocs(q);
                const parts = querySnapshot.docs.map(docToStory);
                setSeriesParts(parts);
            }
            setLoading(false);
        };

        fetchStory();
    }, [storyId]);

    if (loading) {
       return (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
            </div>
       )
    }

    if (!story) {
        // This case will be handled by notFound() in useEffect, but as a fallback:
        return (
             <div className="flex justify-center items-center min-h-[50vh]">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-lg text-center">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight text-2xl">Story Not Found</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <p className="text-lg text-destructive">The requested story does not exist.</p>
                    </div>
                </div>
            </div>
        );
    }

    return <ReaderView story={story} seriesParts={seriesParts} />;
}
