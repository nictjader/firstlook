
import ReaderView from '@/components/story/reader-view';
import { notFound } from 'next/navigation';
import { getStoryById, getSeriesParts, getStories } from '@/lib/actions/storyActions';
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

  const storyTitle = story.seriesTitle ? `${story.seriesTitle} - Chapter ${story.partNumber}` : story.title;

  return {
    title: `${storyTitle} - FirstLook`,
    description: story.synopsis,
    openGraph: {
      title: story.title,
      description: story.synopsis,
      images: [
        {
          url: story.coverImageUrl || PLACEHOLDER_IMAGE_URL,
          width: 600,
          height: 900,
          alt: `Cover for ${story.title}`,
        },
      ],
      url: `https://www.tryfirstlook.com/stories/${story.storyId}`,
      type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: story.title,
        description: story.synopsis,
        images: [story.coverImageUrl || PLACEHOLDER_IMAGE_URL],
    },
  };
}

// This function tells Next.js which story IDs to pre-render at build time.
export async function generateStaticParams() {
  const stories = await getStories();
 
  return stories.map((story) => ({
    storyId: story.storyId,
  }));
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
