import { MetadataRoute } from 'next';
import { getMatchesByDate } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { SITE_URL } from '@/lib/constants';
import { subDays, addDays } from 'date-fns';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  // Fetch matches for 3 days
  const [todayMatches, yesterdayMatches, tomorrowMatches] = await Promise.allSettled([
    getMatchesByDate(formatDate(today)),
    getMatchesByDate(formatDate(yesterday)),
    getMatchesByDate(formatDate(tomorrow)),
  ]);

  const allMatches = [
    ...(todayMatches.status === 'fulfilled' ? todayMatches.value : []),
    ...(yesterdayMatches.status === 'fulfilled' ? yesterdayMatches.value : []),
    ...(tomorrowMatches.status === 'fulfilled' ? tomorrowMatches.value : []),
  ];

  const matchUrls: MetadataRoute.Sitemap = allMatches.map((match) => ({
    url: `${SITE_URL}/match/${match.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    { url: `${SITE_URL}/fifa`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/ucl`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/ufa`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    ...matchUrls,
  ];
}
