/**
 * fallback-api.ts
 * ─────────────────────────────────────────────────
 * Fallback data provider using football-data.org (v4)
 * when ALL api-football.com keys are exhausted.
 *
 * Key differences from api-football.com:
 *  • Auth header: X-Auth-Token (not x-apisports-key)
 *  • Status codes: SCHEDULED, IN_PLAY, PAUSED, FINISHED, etc.
 *  • IDs: football-data.org uses its own competition/team IDs
 *  • Endpoint: /v4/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 *
 * We map those onto our existing ProcessedMatch shape so the
 * rest of the codebase requires ZERO changes.
 */

import { ProcessedMatch } from './types';
import { getCurrentUtcSlot } from './constants';

// ─── Config ───────────────────────────────────────────────────────────────────

const FALLBACK_BASE_URL = 'https://api.football-data.org/v4';

/**
 * Comma-separated list of football-data.org API tokens stored in env.
 * At minimum the one provided: 1d30623e152f4c72bdd3edc98f5220fb
 */
function getFallbackKeys(): string[] {
  const raw = process.env.FOOTBALL_DATA_KEYS || '';
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

// ─── Simple per-key cooldown tracker (429 handling) ───────────────────────────

interface KeyState {
  cooldownUntil: number; // epoch ms — 0 means no cooldown
  usedToday: number;
  lastResetDate: string; // YYYY-MM-DD
}

const keyStates = new Map<string, KeyState>();

function getOrInitState(key: string): KeyState {
  const today = new Date().toISOString().slice(0, 10);
  let state = keyStates.get(key);
  if (!state || state.lastResetDate !== today) {
    state = { cooldownUntil: 0, usedToday: 0, lastResetDate: today };
    keyStates.set(key, state);
  }
  return state;
}

function isKeyAvailable(key: string): boolean {
  const state = getOrInitState(key);
  if (Date.now() < state.cooldownUntil) return false;
  if (state.usedToday >= 10) return false; // free tier: ~10 requests/min
  return true;
}

function markKeyUsed(key: string): void {
  const state = getOrInitState(key);
  state.usedToday += 1;
}

function markKeyRateLimited(key: string): void {
  const state = getOrInitState(key);
  state.cooldownUntil = Date.now() + 61_000; // 61-second cooldown
  console.warn(`[Fallback] Key ...${key.slice(-6)} rate-limited, cooling down.`);
}

// ─── UTC-slot-based cache (same 10-min UTC alignment as primary) ──────────────

const fallbackCache = new Map<string, { data: ProcessedMatch[]; slot: number }>();

function getFallbackCached(key: string): ProcessedMatch[] | null {
  const entry = fallbackCache.get(key);
  if (!entry) return null;
  const currentSlot = getCurrentUtcSlot();
  if (entry.slot !== currentSlot) {
    fallbackCache.delete(key);
    return null;
  }
  return entry.data;
}

function setFallbackCache(key: string, data: ProcessedMatch[]): void {
  fallbackCache.set(key, { data, slot: getCurrentUtcSlot() });
}

// ─── football-data.org response types ─────────────────────────────────────────

interface FDCompetition {
  id: number;
  name: string;
  code: string | null;
  type: string;
  emblem: string | null;
  area: { id: number; name: string; code: string; flag: string | null };
}

interface FDTeam {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

interface FDScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

interface FDMatch {
  id: number;
  utcDate: string;
  status:
    | 'SCHEDULED'
    | 'TIMED'
    | 'IN_PLAY'
    | 'PAUSED'
    | 'FINISHED'
    | 'CANCELLED'
    | 'POSTPONED'
    | 'SUSPENDED'
    | 'AWARDED';
  matchday: number | null;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
  competition: FDCompetition;
  venue?: string | null;
  referees?: { id: number; name: string; type: string; nationality: string }[];
}

interface FDMatchesResponse {
  filters: Record<string, string>;
  resultSet: { count: number; competitions: string; first: string; last: string; played: number };
  competition?: FDCompetition;
  matches: FDMatch[];
}

// ─── Status mapping: football-data.org → our short codes ─────────────────────

const FD_STATUS_MAP: Record<string, { short: string; long: string }> = {
  SCHEDULED:  { short: 'NS',   long: 'Not Started' },
  TIMED:      { short: 'NS',   long: 'Not Started' },
  IN_PLAY:    { short: '1H',   long: 'In Play' },
  PAUSED:     { short: 'HT',   long: 'Half Time' },
  FINISHED:   { short: 'FT',   long: 'Full Time' },
  CANCELLED:  { short: 'CANC', long: 'Cancelled' },
  POSTPONED:  { short: 'PST',  long: 'Postponed' },
  SUSPENDED:  { short: 'SUSP', long: 'Suspended' },
  AWARDED:    { short: 'AWD',  long: 'Technical Loss' },
};

// ─── Competition priority (football-data.org IDs) ────────────────────────────
// Maps fd competition IDs → priority number (lower = higher priority)

const FD_COMP_PRIORITY: Record<number, number> = {
  2000: 1,  // FIFA World Cup
  2001: 2,  // UEFA Champions League
  2018: 3,  // European Championship (UEFA Euro)
  2146: 4,  // UEFA Europa League
  2154: 5,  // UEFA Conference League
  2152: 6,  // Copa Libertadores
  2080: 7,  // Copa America
  2021: 8,  // Premier League
  2014: 9,  // La Liga
  2002: 10, // Bundesliga
  2019: 11, // Serie A
  2015: 12, // Ligue 1
  2003: 13, // Eredivisie
  2017: 14, // Primeira Liga
  2013: 15, // Brasileirão
};

// ─── Helper: map a single FDMatch to our ProcessedMatch ───────────────────────

// ─── Guard: skip matches with missing critical fields ────────────────────────

function isValidFDMatch(m: FDMatch): boolean {
  return (
    !!m &&
    !!m.id &&
    !!m.utcDate &&
    !!m.status &&
    !!m.competition &&
    !!m.competition.id &&
    !!m.competition.name &&
    !!m.competition.area &&
    !!m.competition.area.name &&
    !!m.homeTeam &&
    !!m.awayTeam
  );
}

// ─── Helper: map a single FDMatch to our ProcessedMatch ───────────────────────

function mapFDMatch(m: FDMatch): ProcessedMatch {
  const statusInfo = FD_STATUS_MAP[m.status] ?? { short: m.status, long: m.status };
  const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
  const elapsed = isLive ? null : null; // fd.org doesn't stream elapsed minutes on free tier

  const homeScore = m.score?.fullTime?.home ?? null;
  const awayScore = m.score?.fullTime?.away ?? null;

  const utcMs = new Date(m.utcDate).getTime();
  const homeName = m.homeTeam?.name || m.homeTeam?.shortName || 'TBD';
  const awayName = m.awayTeam?.name || m.awayTeam?.shortName || 'TBD';
  
  const teamSlug = `${homeName.toLowerCase().replace(/\s+/g, '-')}-vs-${awayName.toLowerCase().replace(/\s+/g, '-')}`;
  const slug = `${m.id}-${teamSlug}`;

  const referee =
    m.referees && m.referees.length > 0
      ? m.referees.find((r) => r.type === 'REFEREE')?.name ?? null
      : null;

  return {
    id: m.id,
    homeTeam: {
      id: m.homeTeam?.id ?? 0,
      name: m.homeTeam?.shortName || homeName,
      logo: m.homeTeam?.crest || '',
    },
    awayTeam: {
      id: m.awayTeam?.id ?? 0,
      name: m.awayTeam?.shortName || awayName,
      logo: m.awayTeam?.crest || '',
    },
    homeScore: homeScore,
    awayScore: awayScore,
    status: statusInfo.long,
    statusShort: statusInfo.short,
    elapsed,
    date: m.utcDate,
    timestamp: Math.floor(utcMs / 1000),
    league: {
      id: m.competition.id,
      name: m.competition.name,
      logo: m.competition?.emblem || '',
      country: m.competition?.area?.name ?? 'International',
      flag: m.competition?.area?.flag ?? null,
      round: m.matchday ? `Regular Season - ${m.matchday}` : (m.stage ?? ''),
    },
    venue: m.venue ?? null,
    referee,
    slug,
  };
}

// ─── Sort by competition priority ─────────────────────────────────────────────

function sortByFDPriority(matches: ProcessedMatch[]): ProcessedMatch[] {
  return [...matches].sort((a, b) => {
    const pa = FD_COMP_PRIORITY[a.league.id] ?? 999;
    const pb = FD_COMP_PRIORITY[b.league.id] ?? 999;
    if (pa !== pb) return pa - pb;
    return a.timestamp - b.timestamp;
  });
}

// ─── Core fetch with key rotation ─────────────────────────────────────────────

async function fallbackFetch(
  path: string
): Promise<FDMatchesResponse> {
  const keys = getFallbackKeys();
  if (keys.length === 0) {
    throw new Error('[Fallback] No football-data.org keys configured.');
  }

  const available = keys.filter(isKeyAvailable);
  if (available.length === 0) {
    throw new Error('[Fallback] All football-data.org keys are rate-limited or exhausted.');
  }

  let lastError: Error | null = null;

  for (const key of available) {
    try {
      const res = await fetch(`${FALLBACK_BASE_URL}${path}`, {
        headers: { 'X-Auth-Token': key },
        next: { revalidate: 600 },
      });

      if (res.status === 429) {
        markKeyRateLimited(key);
        lastError = new Error(`[Fallback] 429 on key ...${key.slice(-6)}`);
        continue;
      }

      if (!res.ok) {
        throw new Error(`[Fallback] HTTP ${res.status}: ${res.statusText} for ${path}`);
      }

      markKeyUsed(key);
      const json: FDMatchesResponse = await res.json();
      return json;
    } catch (err) {
      if (err instanceof Error && err.message.includes('429')) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error('[Fallback] All keys failed.');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get matches for a given date from football-data.org.
 * Returns matches shaped as ProcessedMatch[] — same as primary.
 *
 * football-data.org free tier supports filtering by date via
 * dateFrom and dateTo query params.
 */
export async function getFallbackMatchesByDate(
  date: string // YYYY-MM-DD
): Promise<ProcessedMatch[]> {
  const cacheKey = `fd:matches:${date}`;
  const cached = getFallbackCached(cacheKey);
  if (cached) return cached;

  try {
    console.log(`[Fallback] Fetching matches for ${date} from football-data.org`);
    
    // We query a two-day window to avoid football-data.org timezone/boundary issues
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 1);
    const nextDate = d.toISOString().slice(0, 10);
    
    const data = await fallbackFetch(
      `/matches?dateFrom=${date}&dateTo=${nextDate}`
    );
    
    // Process and strictly filter for just the targeted date string locally
    // Skip any matches with missing required fields (guard)
    const processed = data.matches
      .filter((m) => m.utcDate?.startsWith(date) && isValidFDMatch(m))
      .map(mapFDMatch);
      
    const sorted = sortByFDPriority(processed);
    setFallbackCache(cacheKey, sorted);
    return sorted;
  } catch (error) {
    console.error('[Fallback] getFallbackMatchesByDate failed:', error);
    return [];
  }
}

/**
 * Get all currently in-play matches from football-data.org.
 * Free tier doesn't have a "/live" endpoint — we use today's
 * matches and filter by status IN_PLAY / PAUSED.
 */
export async function getFallbackLiveMatches(): Promise<ProcessedMatch[]> {
  const today = new Date().toISOString().slice(0, 10);
  const allToday = await getFallbackMatchesByDate(today);
  return allToday.filter(
    (m) => m.statusShort === '1H' || m.statusShort === 'HT' || m.statusShort === '2H'
  );
}

/**
 * Attempt to get single match detail from football-data.org by match ID.
 * NOTE: football-data.org's free tier supports GET /v4/matches/{id}
 */
export async function getFallbackMatchById(
  id: number
): Promise<ProcessedMatch | null> {
  const cacheKey = `fd:match:${id}`;
  const cached = getFallbackCached(cacheKey);
  if (cached && cached.length > 0) return cached[0];

  try {
    const keys = getFallbackKeys();
    if (keys.length === 0) return null;

    const available = keys.filter(isKeyAvailable);
    if (available.length === 0) return null;

    for (const key of available) {
      try {
        const res = await fetch(`${FALLBACK_BASE_URL}/matches/${id}`, {
          headers: { 'X-Auth-Token': key },
          next: { revalidate: 600 },
        });

        if (res.status === 429) {
          markKeyRateLimited(key);
          continue;
        }

        if (!res.ok) {
          console.warn(`[Fallback] HTTP ${res.status} for match ${id}`);
          continue;
        }

        markKeyUsed(key);
        const json = await res.json();

        // Single match endpoint returns a match object directly (not wrapped in matches array)
        // Validate it has the expected shape
        if (!json || typeof json !== 'object') return null;

        const match: FDMatch = json.id ? json : null;
        if (!match || !match.id || !match.homeTeam || !match.awayTeam) return null;

        const processed = mapFDMatch(match);
        setFallbackCache(cacheKey, [processed]);
        return processed;
      } catch (innerErr) {
        console.warn(`[Fallback] Key error for match ${id}:`, innerErr);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error(`[Fallback] getFallbackMatchById(${id}) failed:`, error);
    return null;
  }
}

/**
 * Log the current state of all fallback keys (for debugging).
 */
export function getFallbackKeyStatus(): Record<
  string,
  { usedToday: number; inCooldown: boolean }
> {
  const keys = getFallbackKeys();
  const result: Record<string, { usedToday: number; inCooldown: boolean }> = {};
  for (const key of keys) {
    const state = getOrInitState(key);
    result[`...${key.slice(-6)}`] = {
      usedToday: state.usedToday,
      inCooldown: Date.now() < state.cooldownUntil,
    };
  }
  return result;
}
