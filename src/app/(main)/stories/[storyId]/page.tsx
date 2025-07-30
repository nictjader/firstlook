
import ReaderView from '@/components/story/reader-view';
import { notFound } from 'next/navigation';
import { getStoryById, getSeriesParts } from '@/app/actions/storyActions';
import type { Metadata } from 'next';


// This function generates metadata for the page based on the story details.
export async function generateMetadata({ params }: { params: { storyId: string } }): Promise<Metadata> {
  const story = await getStoryById(params.storyId);

  if (!story) {
    return {
      title: 'Story Not Found',
    };
  }

  return {
    title: `${story.title} - Siren`,
    description: story.previewText,
    openGraph: {
      title: story.title,
      description: story.previewText,
      images: [
        {
          url: story.coverImageUrl || 'https://placehold.co/1200x630.png',
          width: 1200,
          height: 630,
          alt: `Cover for ${story.title}`,
        },
      ],
    },
  };
}

// This is now a Server Component that fetches data before rendering.
export default async function StoryPage({ params }: { params: { storyId: string } }) {
    const story = await getStoryById(params.storyId);

    if (!story) {
        notFound();
    }

    const seriesParts = story.seriesId ? await getSeriesParts(story.seriesId) : [];

    return <ReaderView story={story} seriesParts={seriesParts} />;
}
