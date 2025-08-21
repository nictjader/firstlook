
import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = 'https://www.tryfirstlook.com/sitemap.xml';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/buy-coins/'],
    },
    sitemap: sitemapUrl,
  };
}
