import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMatchById, getMatchEvents, getMatchLineups, getMatchStatistics, getHeadToHead, getStandings } from '@/lib/api';
import { processFixture, getCurrentSeason } from '@/lib/utils';
import { getMatchMeta, getMatchJsonLd, getBreadcrumbJsonLd } from '@/lib/seo';
import SchemaMarkup from '@/components/SchemaMarkup';
import MatchDetailClient from '@/components/MatchDetailClient';
import { SITE_URL } from '@/lib/constants';

export const revalidate = 600;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const matchId = parseInt(params.id.split('-')[0]);
  if (isNaN(matchId)) return { title: 'Match Not Found' };

  const fixture = await getMatchById(matchId);
  if (!fixture) return { title: 'Match Not Found' };

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

export default async function MatchPage({ params }: Props) {
  const matchId = parseInt(params.id.split('-')[0]);

  if (isNaN(matchId)) notFound();

  const [fixture, events, lineups, statistics] = await Promise.allSettled([
    getMatchById(matchId),
    getMatchEvents(matchId),
    getMatchLineups(matchId),
    getMatchStatistics(matchId),
  ]);

  const fixtureData = fixture.status === 'fulfilled' ? fixture.value : null;
  if (!fixtureData) notFound();

  const match = processFixture(fixtureData);

  // Fetch h2h and standings in parallel
  const season = getCurrentSeason();
  const [h2hData, standingsData] = await Promise.allSettled([
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
      />
    </>
  );
}
