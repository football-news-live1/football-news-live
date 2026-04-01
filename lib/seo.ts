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
    title: `Live Football Scores, Fixtures & Results Today | ${SITE_NAME}`,
    description:
      `${SITE_NAME} — your #1 source for real-time football scores, today's fixtures, live match updates, and results. ` +
      'Covering Premier League, Champions League, La Liga, Serie A, Bundesliga, Ligue 1, FIFA World Cup, and 100+ leagues worldwide. Updated every 10 minutes.',
    keywords:
      'live football scores, football news live, footballnewslive, football results today, football fixtures, ' +
      'football live scores today, live score football, today football match score, football match live, ' +
      'premier league scores, champions league live, la liga live scores, bundesliga results, ' +
      'serie a scores, ligue 1 results, fifa world cup live, europa league scores, ' +
      'football standings, football match results today, live football updates',
    canonical: SITE_URL,
    ogImage: `${SITE_URL}/og-image.png`,
    ogType: 'website',
  };
}

export function getMatchMeta(match: ProcessedMatch): MetaData {
  const matchTitle = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const dateStr = formatFullDateTime(match.date);
  return {
    title: `${matchTitle} — Live Score & Result | ${match.league.name} | ${SITE_NAME}`,
    description:
      `Follow ${matchTitle} live score, lineups, statistics and match events on ${SITE_NAME}. ` +
      `${match.league.name} match on ${dateStr}. ` +
      `Get real-time updates, head-to-head stats, and standings.`,
    keywords:
      `${match.homeTeam.name} vs ${match.awayTeam.name}, ${match.homeTeam.name} live score, ` +
      `${match.awayTeam.name} live score, ${match.league.name} scores, ` +
      `${match.homeTeam.name} match today, ${match.awayTeam.name} match today, ` +
      `live score, football live, ${match.league.name} results`,
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
    description: `${match.homeTeam.name} vs ${match.awayTeam.name} live score and match updates in ${match.league.name}. Follow on ${SITE_NAME}.`,
    sport: 'Football',
    organizer: {
      '@type': 'Organization',
      name: match.league.name,
    },
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url: `${SITE_URL}/match/${match.slug}`,
  };
}

export function getWebsiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Live football scores, fixtures and results from Premier League, Champions League, La Liga, Serie A, Bundesliga, and 100+ leagues worldwide.',
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.png`,
      },
    },
  };
}

export function getOrganizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description:
      'Live football scores, fixtures, results, and match statistics from all major football leagues worldwide.',
    foundingDate: '2026',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/contact`,
    },
  };
}

export function getBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): object {
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

export function getTournamentMeta(
  name: string,
  slug: string,
  description: string
): MetaData {
  return {
    title: `${name} Live Scores, Fixtures & Results | ${SITE_NAME}`,
    description: `${description} Follow ${name} live scores, fixtures, standings, and match results on ${SITE_NAME}. Updated every 10 minutes.`,
    keywords: `${name} live scores, ${name} fixtures, ${name} results, ${name} standings, ${name} football, ${name} matches today, ${SITE_NAME.toLowerCase()}`,
    canonical: `${SITE_URL}/${slug}`,
    ogImage: `${SITE_URL}/og-image.png`,
    ogType: 'website',
  };
}
