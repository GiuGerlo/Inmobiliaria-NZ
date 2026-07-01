import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/api';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, '');
  const properties = await getCatalog();

  const staticPages = ['', '/propiedades', '/vendidas'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const propertyPages = properties.map((p) => ({
    url: `${base}/propiedades/${p.slug}`,
    lastModified: p.is_sold ? new Date('2025-01-01') : new Date(),
    changeFrequency: p.is_sold ? ('yearly' as const) : ('monthly' as const),
    priority: p.is_sold ? 0.3 : 0.6,
  }));

  return [...staticPages, ...propertyPages];
}
