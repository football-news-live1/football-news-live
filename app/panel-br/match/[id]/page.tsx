import { notFound } from 'next/navigation';
import { getMatchById, getMatchEvents, getMatchLineups, getMatchStatistics, getHeadToHead, getStandings } from '@/lib/api';
import { processFixture, getCurrentSeason } from '@/lib/utils';
import MatchDetailClient from '@/components/MatchDetailClient';

export const revalidate = 60;

interface Props {
  params: { id: string };
}

// noindex inherited from /panel-br/layout.tsx

export default async function AdminMatchPage({ params }: Props) {
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

  return (
    <MatchDetailClient
      match={match}
      fixture={fixtureData}
      events={eventsData}
      lineups={lineupsData}
      statistics={statisticsData}
      h2h={h2h}
      standings={standings}
      isAdmin={true}
      matchId={matchId}
    />
  );
}
