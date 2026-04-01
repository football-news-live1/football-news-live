import { API_BASE_URL, CACHE_DURATION } from './constants';
import {
  ApiResponse,
  Fixture,
  MatchEvent,
  Lineup,
  MatchStatistics,
  StandingsGroup,
  ProcessedMatch,
} from './types';
import { processFixture, sortMatchesByLeaguePriority } from './utils';

// =========================================
// In-memory cache to minimize API calls
// =========================================
const cache = new Map<string, { data: unknown; timestamp: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// =========================================
// API key rotation (use key2 as fallback)
// =========================================
let useKey2 = false;

function getApiKey(): string {
  if (useKey2) {
    return process.env.API_FOOTBALL_KEY_2 || process.env.API_FOOTBALL_KEY || '';
  }
  return process.env.API_FOOTBALL_KEY || '';
}

async function apiFetch<T>(endpoint: string): Promise<ApiResponse<T>> {
  const cacheKey = endpoint;
  const cached = getCached<ApiResponse<T>>(cacheKey);
  if (cached) return cached;

  const url = `${API_BASE_URL}${endpoint}`;
  const apiKey = getApiKey();

  const res = await fetch(url, {
    headers: {
      'x-apisports-key': apiKey,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 429) {
      if (!useKey2) {
        console.log('Primary API key rate limited, switching to secondary key...');
        useKey2 = true;
        return apiFetch<T>(endpoint);
      }
      throw new Error('API rate limit exceeded on both keys');
    }
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const data: ApiResponse<T> = await res.json();

  if (res.status === 429 || (data.errors && typeof data.errors === 'object' && 'requests' in data.errors)) {
    // Rate limited or daily quota exceeded - try second key
    if (!useKey2) {
      console.log('Primary API key quota exceeded, switching to secondary key...');
      useKey2 = true;
      return apiFetch<T>(endpoint);
    }
    throw new Error('API rate limit/quota exceeded on both keys');
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error(`API error: ${data.errors.join(', ')}`);
  }

  if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
    throw new Error(`API error: ${JSON.stringify(data.errors)}`);
  }

  setCache(cacheKey, data);
  return data;
}

// =========================================
// API Functions
// =========================================

/**
 * Get all matches for a given date (YYYY-MM-DD)
 */
export async function getMatchesByDate(date: string): Promise<ProcessedMatch[]> {
  try {
    const data = await apiFetch<Fixture>(`/fixtures?date=${date}&timezone=Asia/Kolkata`);
    const processed = data.response.map(processFixture);
    return sortMatchesByLeaguePriority(processed);
  } catch (error) {
    console.error('getMatchesByDate error:', error);
    return [];
  }
}

/**
 * Get detailed match info by fixture ID
 */
export async function getMatchById(id: number): Promise<Fixture | null> {
  try {
    const data = await apiFetch<Fixture>(`/fixtures?id=${id}`);
    return data.response[0] || null;
  } catch (error) {
    console.error('getMatchById error:', error);
    return null;
  }
}

/**
 * Get match events (goals, cards, substitutions)
 */
export async function getMatchEvents(id: number): Promise<MatchEvent[]> {
  try {
    const data = await apiFetch<MatchEvent>(`/fixtures/events?fixture=${id}`);
    return data.response;
  } catch (error) {
    console.error('getMatchEvents error:', error);
    return [];
  }
}

/**
 * Get team lineups for a match
 */
export async function getMatchLineups(id: number): Promise<Lineup[]> {
  try {
    const data = await apiFetch<Lineup>(`/fixtures/lineups?fixture=${id}`);
    return data.response;
  } catch (error) {
    console.error('getMatchLineups error:', error);
    return [];
  }
}

/**
 * Get match statistics
 */
export async function getMatchStatistics(id: number): Promise<MatchStatistics[]> {
  try {
    const data = await apiFetch<MatchStatistics>(`/fixtures/statistics?fixture=${id}`);
    return data.response;
  } catch (error) {
    console.error('getMatchStatistics error:', error);
    return [];
  }
}

/**
 * Get head-to-head fixtures between two teams
 */
export async function getHeadToHead(team1: number, team2: number): Promise<Fixture[]> {
  try {
    const data = await apiFetch<Fixture>(
      `/fixtures/headtohead?h2h=${team1}-${team2}&last=5`
    );
    return data.response;
  } catch (error) {
    console.error('getHeadToHead error:', error);
    return [];
  }
}

/**
 * Get league standings
 */
export async function getStandings(league: number, season: number): Promise<StandingsGroup | null> {
  try {
    const data = await apiFetch<StandingsGroup>(`/standings?league=${league}&season=${season}`);
    return data.response[0] || null;
  } catch (error) {
    console.error('getStandings error:', error);
    return null;
  }
}

/**
 * Get all currently live matches
 */
export async function getLiveMatches(): Promise<ProcessedMatch[]> {
  try {
    const data = await apiFetch<Fixture>('/fixtures?live=all');
    const processed = data.response.map(processFixture);
    return sortMatchesByLeaguePriority(processed);
  } catch (error) {
    console.error('getLiveMatches error:', error);
    return [];
  }
}

/**
 * Get all match detail data in one call (for match detail page)
 */
export async function getFullMatchData(id: number) {
  try {
    const [fixture, events, lineups, statistics] = await Promise.allSettled([
      getMatchById(id),
      getMatchEvents(id),
      getMatchLineups(id),
      getMatchStatistics(id),
    ]);

    return {
      fixture: fixture.status === 'fulfilled' ? fixture.value : null,
      events: events.status === 'fulfilled' ? events.value : [],
      lineups: lineups.status === 'fulfilled' ? lineups.value : [],
      statistics: statistics.status === 'fulfilled' ? statistics.value : [],
    };
  } catch (error) {
    console.error('getFullMatchData error:', error);
    return { fixture: null, events: [], lineups: [], statistics: [] };
  }
}
