import { MetadataRoute } from 'next';
import { getMatchesByDate } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { SITE_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date();

  // Only fetch today's matches to save API calls (was 3 calls before)
  const todayMatches = await getMatchesByDate(formatDate(today)).catch(() => []);

  const matchUrls: MetadataRoute.Sitemap = todayMatches.map((match) => ({
    url: `${SITE_URL}/match/${match.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  return [
    // Homepage — highest priority
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },

    // Tournament pages
    { url: `${SITE_URL}/fifa`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/ucl`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/ufa`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },

    // Static content pages — important for SEO trust & E-E-A-T
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },

    // Today's match pages
    ...matchUrls,
  ];
}
