
import { getStoryById, getStoriesBySeriesId } from '@/lib/services/storyService';
import ReaderView from '@/components/story/reader-view';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Story } from '@/lib/types';

export default async function StoryPage({ params }: { params: { storyId: string } }) {
    if (!params.storyId) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-destructive">No story ID provided.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const story = await getStoryById(params.storyId);

    if (!story) {
        notFound();
    }

    // Fetch series parts here in the Server Component
    let seriesParts: Story[] = [];
    if (story.seriesId) {
        seriesParts = await getStoriesBySeriesId(story.seriesId);
    }

    // Pass both the story and the series parts to the client component
    return <ReaderView story={story} seriesParts={seriesParts} />;
}
