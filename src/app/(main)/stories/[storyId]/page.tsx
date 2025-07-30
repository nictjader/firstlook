
import ReaderView from '@/components/story/reader-view';
import { notFound } from 'next/navigation';
import { getStoryById, getSeriesParts } from '@/lib/actions/storyActions';
import type { Metadata } from 'next';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/config';


// This function generates metadata for the page based on the story details.
export async function generateMetadata({ params }: { params: { storyId: string } }): Promise<Metadata> {
  const story = await getStoryById(params.storyId);

  if (!story) {
    return {
      title: 'Story Not Found',
    };
  }

  return {
    title: `${story.title} - FirstLook`,
    description: story.previewText,
    openGraph: {
      title: story.title,
      description: story.previewText,
      images: [
        {
          url: story.coverImageUrl || PLACEHOLDER_IMAGE_URL,
          width: 600,
          height: 900,
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
