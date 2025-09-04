
import { MetadataRoute } from 'next';
import { getAdminDb } from './lib/firebase/admin';
import type { Story } from './lib/types';
import { type Timestamp } from 'firebase-admin/firestore';

// This is a simplified version of the Story type for the sitemap
interface SitemapStory {
    storyId: string;
    publishedAt: Timestamp;
}

async function getAllStoriesForSitemap(): Promise<SitemapStory[]> {
    try {
        const db = await getAdminDb();
        const storiesRef = db.collection('stories');
        // Fetch only the fields needed for the sitemap
        const snapshot = await storiesRef.select('storyId', 'publishedAt').orderBy('publishedAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        // Map to a simpler object to avoid complex type issues during build
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                storyId: doc.id,
                publishedAt: data.publishedAt as Timestamp,
            };
        });
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
    lastModified: story.publishedAt.toDate().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...storyRoutes];
}
