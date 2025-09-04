
import { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { docToStoryAdmin } from '@/lib/firebase/server-types';
import type { Story } from '@/lib/types';

async function getAllStoriesForSitemap(): Promise<Story[]> {
    try {
        const db = await getAdminDb();
        const storiesRef = db.collection('stories');
        const snapshot = await storiesRef.orderBy('publishedAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => docToStoryAdmin(doc));
    } catch (error) {
        console.error("Failed to fetch stories for sitemap, returning empty array.", error);
        return [];
    }
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://www.tryfirstlook.com';

  // Base pages
  const routes = ['', '/privacy', '/terms', '/feedback'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.7,
  }));
  
  // Story pages
  const stories = await getAllStoriesForSitemap();
  const storyRoutes = stories.map((story) => ({
    url: `${siteUrl}/stories/${story.storyId}`,
    lastModified: new Date(story.publishedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...storyRoutes];
}
