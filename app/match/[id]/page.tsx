import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMatchById, getMatchEvents, getMatchLineups, getMatchStatistics, getHeadToHead, getStandings } from '@/lib/api';
import { processFixture, getCurrentSeason } from '@/lib/utils';
import { getMatchMeta, getMatchJsonLd, getBreadcrumbJsonLd } from '@/lib/seo';
import SchemaMarkup from '@/components/SchemaMarkup';
import MatchDetailClient from '@/components/MatchDetailClient';
import { SITE_URL } from '@/lib/constants';
import { getFallbackMatchById } from '@/lib/fallback-api';
import { Fixture } from '@/lib/types';

export const revalidate = 600;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const matchId = parseInt(params.id.split('-')[0]);
  if (isNaN(matchId)) return { title: 'Match Not Found' };

  const fixture = await getMatchById(matchId);

  // If primary API fails, try fallback for metadata
  if (!fixture) {
    const fallbackMatch = await getFallbackMatchById(matchId);
    if (!fallbackMatch) return { title: 'Match Not Found' };

    const meta = getMatchMeta(fallbackMatch);
    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      alternates: { canonical: meta.canonical },
    };
  }

  const match = processFixture(fixture);
  const meta = getMatchMeta(match);

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: meta.canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      type: 'article',
      images: [{ url: match.homeTeam.logo || meta.ogImage, width: 200, height: 200, alt: match.homeTeam.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

/**
 * Build a minimal Fixture object from a ProcessedMatch (fallback data).
 * MatchDetailClient expects a Fixture for halftime scores etc.
 * Fallback data doesn't have this, so we construct a stub.
 */
function buildStubFixture(match: import('@/lib/types').ProcessedMatch): Fixture {
  return {
    fixture: {
      id: match.id,
      referee: match.referee,
      timezone: 'UTC',
      date: match.date,
      timestamp: match.timestamp,
      periods: { first: null, second: null },
      venue: { id: null, name: match.venue, city: null },
      status: { long: match.status, short: match.statusShort, elapsed: match.elapsed },
    },
    league: {
      id: match.league.id,
      name: match.league.name,
      country: match.league.country,
      logo: match.league.logo,
      flag: match.league.flag,
      season: getCurrentSeason(),
      round: match.league.round,
    },
    teams: {
      home: { id: match.homeTeam.id, name: match.homeTeam.name, logo: match.homeTeam.logo, winner: null },
      away: { id: match.awayTeam.id, name: match.awayTeam.name, logo: match.awayTeam.logo, winner: null },
    },
    goals: { home: match.homeScore, away: match.awayScore },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: match.homeScore, away: match.awayScore },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

export default async function MatchPage({ params }: Props) {
  const matchId = parseInt(params.id.split('-')[0]);

  if (isNaN(matchId)) notFound();

  // Try primary API first
  const [fixture, events, lineups, statistics] = await Promise.allSettled([
    getMatchById(matchId),
    getMatchEvents(matchId),
    getMatchLineups(matchId),
    getMatchStatistics(matchId),
  ]);

  let fixtureData = fixture.status === 'fulfilled' ? fixture.value : null;
  let isFallback = false;

  // If primary failed, try fallback provider
  if (!fixtureData) {
    const fallbackMatch = await getFallbackMatchById(matchId);
    if (fallbackMatch) {
      fixtureData = buildStubFixture(fallbackMatch);
      isFallback = true;
    }
  }

  if (!fixtureData) notFound();

  const match = processFixture(fixtureData);

  // Fetch h2h and standings in parallel (skip for fallback — save API calls)
  const season = getCurrentSeason();
  const [h2hData, standingsData] = isFallback
    ? [{ status: 'fulfilled' as const, value: [] }, { status: 'fulfilled' as const, value: null }]
    : await Promise.allSettled([
        getHeadToHead(match.homeTeam.id, match.awayTeam.id),
        getStandings(match.league.id, season),
      ]);

  const eventsData = events.status === 'fulfilled' ? events.value : [];
  const lineupsData = lineups.status === 'fulfilled' ? lineups.value : [];
  const statisticsData = statistics.status === 'fulfilled' ? statistics.value : [];
  const h2h = h2hData.status === 'fulfilled' ? h2hData.value : [];
  const standings = standingsData.status === 'fulfilled' ? standingsData.value : null;

  const matchSchema = getMatchJsonLd(match);
  const breadcrumbSchema = getBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: match.league.name, url: `${SITE_URL}/#${match.league.id}` },
    { name: `${match.homeTeam.name} vs ${match.awayTeam.name}`, url: `${SITE_URL}/match/${match.slug}` },
  ]);

  return (
    <>
      <SchemaMarkup data={matchSchema} />
      <SchemaMarkup data={breadcrumbSchema} />

      <MatchDetailClient
        match={match}
        fixture={fixtureData}
        events={eventsData}
        lineups={lineupsData}
        statistics={statisticsData}
        h2h={h2h}
        standings={standings}
        matchId={matchId}
        isFallback={isFallback}
      />
    </>
  );
}
