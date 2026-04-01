import { SITE_NAME, SITE_URL } from './constants';
import { ProcessedMatch } from './types';
import { formatFullDateTime } from './utils';

export interface MetaData {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  ogType: string;
}

export function getHomepageMeta(): MetaData {
  return {
    title: `Live Football Scores, Fixtures & Results | ${SITE_NAME}`,
    description:
      'Get real-time football scores, today\'s fixtures, yesterday\'s results and tomorrow\'s upcoming matches. Live updates from Premier League, Champions League, La Liga and more.',
    keywords:
      'live football scores, football results today, football fixtures, premier league scores, champions league live, la liga, bundesliga, serie a, ligue 1',
    canonical: SITE_URL,
    ogImage: `${SITE_URL}/og-image.png`,
    ogType: 'website',
  };
}

export function getMatchMeta(match: ProcessedMatch): MetaData {
  const matchTitle = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const dateStr = formatFullDateTime(match.date);
  return {
    title: `${matchTitle} Live Score | ${match.league.name} | ${SITE_NAME}`,
    description: `Follow ${matchTitle} live score, lineups, statistics and match events. ${match.league.name} match on ${dateStr}.`,
    keywords: `${match.homeTeam.name} vs ${match.awayTeam.name}, ${match.homeTeam.name} score, ${match.awayTeam.name} score, live score, ${match.league.name}`,
    canonical: `${SITE_URL}/match/${match.slug}`,
    ogImage: match.homeTeam.logo || `${SITE_URL}/og-image.png`,
    ogType: 'article',
  };
}

export function getMatchJsonLd(match: ProcessedMatch): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    startDate: match.date,
    location: {
      '@type': 'Place',
      name: match.venue || 'TBA',
    },
    homeTeam: {
      '@type': 'SportsTeam',
      name: match.homeTeam.name,
      logo: match.homeTeam.logo,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: match.awayTeam.name,
      logo: match.awayTeam.logo,
    },
    competitor: [
      { '@type': 'SportsTeam', name: match.homeTeam.name },
      { '@type': 'SportsTeam', name: match.awayTeam.name },
    ],
    description: `${match.homeTeam.name} vs ${match.awayTeam.name} in ${match.league.name}`,
    sport: 'Football',
    organizer: {
      '@type': 'Organization',
      name: match.league.name,
    },
  };
}

export function getWebsiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Live football scores, fixtures and results from all major leagues.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
