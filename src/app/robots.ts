
import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml` : 'https://www.tryfirstlook.com/sitemap.xml';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/buy-coins/'],
    },
    sitemap: sitemapUrl,
  };
}
