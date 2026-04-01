import { format, addDays, subDays, parseISO } from 'date-fns';
import { Fixture, ProcessedMatch } from './types';
import { LEAGUE_PRIORITY, LIVE_STATUSES, FINISHED_STATUSES } from './constants';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getDateForFilter(filter: 'yesterday' | 'today' | 'tomorrow'): Date {
  const today = new Date();
  if (filter === 'yesterday') return subDays(today, 1);
  if (filter === 'tomorrow') return addDays(today, 1);
  return today;
}

export function formatDisplayDate(date: Date): string {
  return format(date, 'EEE, dd MMM yyyy');
}

export function formatKickoffTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm');
  } catch {
    return '--:--';
  }
}

export function formatFullDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE, dd MMMM yyyy HH:mm');
  } catch {
    return dateString;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function createMatchSlug(id: number, homeTeam: string, awayTeam: string): string {
  return `${id}-${slugify(homeTeam)}-vs-${slugify(awayTeam)}`;
}

export function isLive(statusShort: string): boolean {
  return LIVE_STATUSES.includes(statusShort);
}

export function isFinished(statusShort: string): boolean {
  return FINISHED_STATUSES.includes(statusShort);
}

export function processFixture(fixture: Fixture): ProcessedMatch {
  const homeTeam = fixture.teams.home;
  const awayTeam = fixture.teams.away;
  return {
    id: fixture.fixture.id,
    homeTeam: { id: homeTeam.id, name: homeTeam.name, logo: homeTeam.logo },
    awayTeam: { id: awayTeam.id, name: awayTeam.name, logo: awayTeam.logo },
    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,
    status: fixture.fixture.status.long,
    statusShort: fixture.fixture.status.short,
    elapsed: fixture.fixture.status.elapsed,
    date: fixture.fixture.date,
    timestamp: fixture.fixture.timestamp,
    league: {
      id: fixture.league.id,
      name: fixture.league.name,
      logo: fixture.league.logo,
      country: fixture.league.country,
      flag: fixture.league.flag || null,
      round: fixture.league.round,
    },
    venue: fixture.fixture.venue?.name || null,
    referee: fixture.fixture.referee || null,
    slug: createMatchSlug(fixture.fixture.id, homeTeam.name, awayTeam.name),
  };
}

export function sortMatchesByLeaguePriority(matches: ProcessedMatch[]): ProcessedMatch[] {
  return [...matches].sort((a, b) => {
    const priorityA = LEAGUE_PRIORITY[a.league.id] ?? 9999;
    const priorityB = LEAGUE_PRIORITY[b.league.id] ?? 9999;
    if (priorityA !== priorityB) return priorityA - priorityB;
    // Lives first within same league
    const aLive = isLive(a.statusShort) ? 0 : 1;
    const bLive = isLive(b.statusShort) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    return a.timestamp - b.timestamp;
  });
}

export function groupMatchesByLeague(matches: ProcessedMatch[]): Record<string, ProcessedMatch[]> {
  const grouped: Record<string, ProcessedMatch[]> = {};
  for (const match of matches) {
    const key = `${match.league.id}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(match);
  }
  return grouped;
}

export function getMatchStatusDisplay(match: ProcessedMatch): string {
  const { statusShort, elapsed } = match;
  if (isLive(statusShort)) {
    if (statusShort === 'HT') return 'HT';
    if (statusShort === 'BT') return 'BT';
    return elapsed ? `${elapsed}'` : 'LIVE';
  }
  if (isFinished(statusShort)) return statusShort;
  if (statusShort === 'PST') return 'PST';
  if (statusShort === 'CANC') return 'CANC';
  return formatKickoffTime(match.date);
}

export function getCurrentSeason(): number {
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
