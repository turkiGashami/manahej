import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { STAGES, SUBJECTS } from '@/lib/taxonomy';
import { siteUrl } from '@/lib/utils';
import { getSupabasePublicClient } from '@/lib/supabase/server';

// Refresh hourly so newly published curricula appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '',
    '/browse',
    ...STAGES.map((s) => `/stage/${s.slug}`),
    ...SUBJECTS.map((s) => `/subject/${s.slug}`),
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: siteUrl(`/${locale}${path}`),
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
      });
    }
  }

  // Published curricula (when a backend is connected).
  const supabase = getSupabasePublicClient();
  if (supabase) {
    const { data } = await supabase
      .from('curricula')
      .select('slug,updated_at')
      .eq('status', 'published')
      .limit(5000);

    for (const c of (data ?? []) as { slug: string; updated_at: string }[]) {
      for (const locale of locales) {
        entries.push({
          url: siteUrl(`/${locale}/curriculum/${c.slug}`),
          lastModified: c.updated_at,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
