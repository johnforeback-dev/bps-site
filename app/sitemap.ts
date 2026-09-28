import type { MetadataRoute } from 'next';
import { SECTIONS, SITE } from '@/lib/config';
import { getPosts } from '@/lib/wix';
import { postHref } from '@/lib/format';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts({ limit: 100 });
  return [
    { url: SITE.url, changeFrequency: 'daily', priority: 1 },
    ...SECTIONS.map((s) => ({ url: `${SITE.url}/${s.slug}`, changeFrequency: 'daily' as const, priority: 0.8 })),
    { url: `${SITE.url}/intelligence`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE.url}/about`, changeFrequency: 'monthly', priority: 0.3 },
    ...posts.map((p) => ({ url: `${SITE.url}${postHref(p)}`, lastModified: p.updated || p.date, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
