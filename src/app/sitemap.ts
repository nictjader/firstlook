
import { MetadataRoute } from 'next';
import { getStories } from '@/lib/actions/storyActions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tryfirstlook.com';

  // Base pages
  const routes = ['', '/privacy', '/terms', '/feedback'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.7,
  }));
  
  // Story pages
  const stories = await getStories();
  const storyRoutes = stories.map((story) => ({
    url: `${siteUrl}/stories/${story.storyId}`,
    lastModified: new Date(story.publishedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...storyRoutes];
}
