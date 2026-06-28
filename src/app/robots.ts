import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth-gated areas — keep them out of the index.
        disallow: ['/ar/admin', '/en/admin', '/ar/upload', '/en/upload'],
      },
    ],
    sitemap: siteUrl('/sitemap.xml'),
    host: siteUrl(),
  };
}
