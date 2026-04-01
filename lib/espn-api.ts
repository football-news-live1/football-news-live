import { ProcessedMatch } from './types';
import { createMatchSlug, sortMatchesByLeaguePriority } from './utils';
import { getCurrentUtcSlot } from './constants';

const ESPN_LEAGUES = [
    { slug: 'eng.1', id: 39, name: 'Premier League', country: 'England', logo: 'https://media.api-sports.io/football/leagues/39.png', flag: 'https://media.api-sports.io/flags/gb-eng.svg' },
    { slug: 'esp.1', id: 140, name: 'La Liga', country: 'Spain', logo: 'https://media.api-sports.io/football/leagues/140.png', flag: 'https://media.api-sports.io/flags/es.svg' },
    { slug: 'ger.1', id: 78, name: 'Bundesliga', country: 'Germany', logo: 'https://media.api-sports.io/football/leagues/78.png', flag: 'https://media.api-sports.io/flags/de.svg' },
    { slug: 'ita.1', id: 135, name: 'Serie A', country: 'Italy', logo: 'https://media.api-sports.io/football/leagues/135.png', flag: 'https://media.api-sports.io/flags/it.svg' },
    { slug: 'fra.1', id: 61, name: 'Ligue 1', country: 'France', logo: 'https://media.api-sports.io/football/leagues/61.png', flag: 'https://media.api-sports.io/flags/fr.svg' },
    { slug: 'uefa.champions', id: 2, name: 'UEFA Champions League', country: 'World', logo: 'https://media.api-sports.io/football/leagues/2.png', flag: null },
    { slug: 'uefa.europa', id: 3, name: 'UEFA Europa League', country: 'World', logo: 'https://media.api-sports.io/football/leagues/3.png', flag: null },
    { slug: 'uefa.conference', id: 848, name: 'UEFA Conference League', country: 'World', logo: 'https://media.api-sports.io/football/leagues/848.png', flag: null },
    { slug: 'ned.1', id: 71, name: 'Eredivisie', country: 'Netherlands', logo: 'https://media.api-sports.io/football/leagues/71.png', flag: 'https://media.api-sports.io/flags/nl.svg' },
    { slug: 'por.1', id: 94, name: 'Primeira Liga', country: 'Portugal', logo: 'https://media.api-sports.io/football/leagues/94.png', flag: 'https://media.api-sports.io/flags/pt.svg' },
    { slug: 'tur.1', id: 203, name: 'Süper Lig', country: 'Turkey', logo: 'https://media.api-sports.io/football/leagues/203.png', flag: 'https://media.api-sports.io/flags/tr.svg' },
    { slug: 'bel.1', id: 144, name: 'Jupiler Pro League', country: 'Belgium', logo: 'https://media.api-sports.io/football/leagues/144.png', flag: 'https://media.api-sports.io/flags/be.svg' },
    { slug: 'bra.1', id: 71, name: 'Serie A', country: 'Brazil', logo: 'https://media.api-sports.io/football/leagues/71.png', flag: 'https://media.api-sports.io/flags/br.svg' },
    { slug: 'mex.1', id: 262, name: 'Liga MX', country: 'Mexico', logo: 'https://media.api-sports.io/football/leagues/262.png', flag: 'https://media.api-sports.io/flags/mx.svg' },
    { slug: 'usa.1', id: 253, name: 'Major League Soccer', country: 'USA', logo: 'https://media.api-sports.io/football/leagues/253.png', flag: 'https://media.api-sports.io/flags/us.svg' },
    { slug: 'ksa.1', id: 307, name: 'Pro League', country: 'Saudi Arabia', logo: 'https://media.api-sports.io/football/leagues/307.png', flag: 'https://media.api-sports.io/flags/sa.svg' },
    { slug: 'arg.1', id: 128, name: 'Liga Profesional Argentina', country: 'Argentina', logo: 'https://media.api-sports.io/football/leagues/128.png', flag: 'https://media.api-sports.io/flags/ar.svg' },
    { slug: 'sco.1', id: 179, name: 'Premiership', country: 'Scotland', logo: 'https://media.api-sports.io/football/leagues/179.png', flag: 'https://media.api-sports.io/flags/gb-sct.svg' },
    { slug: 'conmebol.libertadores', id: 13, name: 'Copa Libertadores', country: 'World', logo: 'https://media.api-sports.io/football/leagues/13.png', flag: null },
    { slug: 'fifa.world', id: 1, name: 'World Cup', country: 'World', logo: 'https://media.api-sports.io/football/leagues/1.png', flag: null },
];

const cache = new Map<string, { data: ProcessedMatch[]; slot: number }>();

function mapESPNStatusToShort(espnStatusName: string): string {
  switch (espnStatusName) {
    case 'STATUS_SCHEDULED': return 'NS';
    case 'STATUS_IN_PROGRESS': return '1H'; // Will adjust based on time if needed
    case 'STATUS_HALFTIME': return 'HT';
    case 'STATUS_SECOND_HALF': return '2H';
    case 'STATUS_FULL_TIME':
    case 'STATUS_FINAL': return 'FT';
    case 'STATUS_CANCELED': return 'CANC';
    case 'STATUS_POSTPONED': return 'PST';
    default: return 'NS';
  }
}

function processESPNEvent(event: any, leagueContext: any): ProcessedMatch | null {
  try {
    const comp = event.competitions?.[0];
    if (!comp) return null;

    const competitors = comp.competitors || [];
    const home = competitors.find((c: any) => c.homeAway === 'home')?.team;
    const away = competitors.find((c: any) => c.homeAway === 'away')?.team;
    
    if (!home || !away) return null;

    const homeScoreStr = competitors.find((c: any) => c.homeAway === 'home')?.score;
    const awayScoreStr = competitors.find((c: any) => c.homeAway === 'away')?.score;

    const statusName = comp.status?.type?.name || 'STATUS_SCHEDULED';
    const state = comp.status?.type?.state || 'pre';
    
    let homeScore: number | null = state === 'pre' ? null : parseInt(homeScoreStr || '0', 10);
    let awayScore: number | null = state === 'pre' ? null : parseInt(awayScoreStr || '0', 10);
    
    if (isNaN(homeScore as number)) homeScore = null;
    if (isNaN(awayScore as number)) awayScore = null;

    let statusShort = mapESPNStatusToShort(statusName);
    let clock = comp.status?.clock || 0;
    
    // ESPN often leaves IN_PROGRESS for both 1st and 2nd half. 
    // We can infer 2H if clock > 45 and status is IN_PROGRESS.
    if (statusShort === '1H' && clock > 45) {
      statusShort = '2H';
    }

    const matchId = parseInt(event.id || '0', 10) || Math.floor(Math.random() * 1000000);

    return {
      id: matchId,
      homeTeam: {
        id: parseInt(home.id || '0', 10),
        name: home.displayName || home.name || 'Unknown Home',
        logo: home.logo || `https://media.api-sports.io/football/teams/${home.id || '0'}.png`
      },
      awayTeam: {
        id: parseInt(away.id || '0', 10),
        name: away.displayName || away.name || 'Unknown Away',
        logo: away.logo || `https://media.api-sports.io/football/teams/${away.id || '0'}.png`
      },
      homeScore,
      awayScore,
      status: comp.status?.type?.description || 'Scheduled',
      statusShort,
      elapsed: state === 'pre' || state === 'post' ? null : clock,
      date: event.date || new Date().toISOString(),
      timestamp: new Date(event.date || Date.now()).getTime() / 1000,
      league: {
        id: leagueContext.id,
        name: leagueContext.name,
        logo: leagueContext.logo,
        country: leagueContext.country,
        flag: leagueContext.flag,
        round: 'Regular Season' // ESPN doesn't cleanly expose round in brief scoreboard
      },
      venue: comp.venue?.fullName || null,
      referee: null, // Referee not in scoreboard
      slug: createMatchSlug(matchId, home.displayName || 'home', away.displayName || 'away')
    };
  } catch (error) {
    console.warn(`[ESPN] Failed to map event`, error);
    return null;
  }
}

async function fetchESPNLeagues(dateQuery: string = ''): Promise<ProcessedMatch[]> {
  const cacheKey = `espn_${dateQuery || 'today'}`;
  const currentSlot = getCurrentUtcSlot();
  
  const entry = cache.get(cacheKey);
  if (entry && entry.slot === currentSlot) {
    return entry.data;
  }

  const matches: ProcessedMatch[] = [];
  
  // Create an array of fetch promises
  const promises = ESPN_LEAGUES.map(async (league) => {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard${dateQuery ? `?dates=${dateQuery}` : ''}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return;
      const data = await res.json();
      
      if (data.events && Array.isArray(data.events)) {
        for (const ev of data.events) {
          const mapped = processESPNEvent(ev, league);
          if (mapped) matches.push(mapped);
        }
      }
    } catch (e) {
      // Ignore individual league failure
    }
  });

  await Promise.allSettled(promises);
  
  const sorted = sortMatchesByLeaguePriority(matches);
  cache.set(cacheKey, { data: sorted, slot: currentSlot });
  
  return sorted;
}

export async function getESPNMatchesByDate(dateYYYYMMDD: string): Promise<ProcessedMatch[]> {
  const dateFormatted = dateYYYYMMDD.replace(/-/g, '');
  return fetchESPNLeagues(dateFormatted);
}

export async function getESPNLiveMatches(): Promise<ProcessedMatch[]> {
  // Pass no date to get current window
  const allMatches = await fetchESPNLeagues('');
  // Filter for live matches using pre-existing states
  return allMatches.filter(m => m.statusShort === '1H' || m.statusShort === '2H' || m.statusShort === 'HT' || m.statusShort === 'ET' || m.statusShort === 'P');
}

// Map ESPN event header to API-Football Fixture for details page
export async function getESPNMatchById(id: number): Promise<any | null> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${id}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    
    const comp = data.header?.competitions?.[0];
    if (!comp) return null;

    const competitors = comp.competitors || [];
    const home = competitors.find((c: any) => c.homeAway === 'home')?.team;
    const away = competitors.find((c: any) => c.homeAway === 'away')?.team;
    const homeScore = competitors.find((c: any) => c.homeAway === 'home')?.score || null;
    const awayScore = competitors.find((c: any) => c.homeAway === 'away')?.score || null;
    
    // Create a stub api-football matching Fixture
    return {
      fixture: {
        id: id,
        referee: null,
        timezone: 'UTC',
        date: comp.date || new Date().toISOString(),
        timestamp: new Date(comp.date || Date.now()).getTime() / 1000,
        periods: { first: null, second: null },
        venue: { id: null, name: comp.venue?.fullName || null, city: null },
        status: {
          long: comp.status?.type?.description || 'Scheduled',
          short: mapESPNStatusToShort(comp.status?.type?.name),
          elapsed: comp.status?.clock || null
        }
      },
      league: {
        id: parseInt(data.header?.league?.id || '0', 10) || ESPN_LEAGUES[0].id, // Avoid breaking if no ID
        name: data.header?.league?.name || data.header?.season?.name || 'Match',
        country: 'World',
        logo: data.header?.league?.logos?.[0]?.href || '',
        flag: null,
        season: new Date().getFullYear(),
        round: 'Regular'
      },
      teams: {
        home: {
          id: parseInt(home?.id || '0', 10),
          name: home?.displayName || home?.name || 'Unknown',
          logo: home?.logos?.[0]?.href || home?.logo || '',
          winner: homeScore !== null && awayScore !== null ? parseInt(homeScore) > parseInt(awayScore) : null
        },
        away: {
          id: parseInt(away?.id || '0', 10),
          name: away?.displayName || away?.name || 'Unknown',
          logo: away?.logos?.[0]?.href || away?.logo || '',
          winner: homeScore !== null && awayScore !== null ? parseInt(awayScore) > parseInt(homeScore) : null
        }
      },
      goals: {
        home: homeScore !== null ? parseInt(homeScore) : null,
        away: awayScore !== null ? parseInt(awayScore) : null
      },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: homeScore !== null ? parseInt(homeScore) : null, away: awayScore !== null ? parseInt(awayScore) : null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      }
    };
  } catch (error) {
    console.error(`[ESPN] Failed to fetch match by ID ${id}`, error);
    return null;
  }
}
