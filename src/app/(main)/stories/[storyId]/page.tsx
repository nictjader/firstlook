
import { getStoryById, getStoriesBySeriesId } from '@/lib/services/storyService';
import ReaderView from '@/components/story/reader-view';
import { notFound } from 'next/navigation';
import type { Story } from '@/lib/types';

export default async function StoryPage({ params }: { params: { storyId: string } }) {
    if (!params.storyId) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-lg text-center">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight text-2xl">Error</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <p className="text-lg text-destructive">No story ID provided.</p>
                    </div>
                </div>
            </div>
        );
    }

    const story = await getStoryById(params.storyId);

    if (!story) {
        notFound();
    }

    let seriesParts: Story[] = [];
    if (story.seriesId) {
        seriesParts = await getStoriesBySeriesId(story.seriesId);
    }

    return <ReaderView story={story} seriesParts={seriesParts} />;
}
