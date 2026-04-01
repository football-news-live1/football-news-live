import { API_BASE_URL, CACHE_DURATION, MAX_RETRY_KEYS, getCurrentUtcSlot } from './constants';
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
import { getKeyManager } from './key-manager';
import {
  getFallbackMatchesByDate,
  getFallbackLiveMatches,
  getFallbackMatchById,
} from './fallback-api';

// =========================================
// UTC-slot-based in-memory cache
// API calls happen at most once per 10-min
// UTC window per unique endpoint
// =========================================
const cache = new Map<string, { data: unknown; slot: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const currentSlot = getCurrentUtcSlot();
  if (entry.slot !== currentSlot) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, slot: getCurrentUtcSlot() });
}

// =========================================
// Request deduplication — prevent duplicate
// in-flight API calls for the same endpoint
// =========================================
const inflightRequests = new Map<string, Promise<unknown>>();

// =========================================
// Core API fetch with multi-key rotation
// =========================================
async function apiFetch<T>(endpoint: string): Promise<ApiResponse<T>> {
  // 1. Check cache first
  const cacheKey = endpoint;
  const cached = getCached<ApiResponse<T>>(cacheKey);
  if (cached) return cached;

  // 2. Deduplicate in-flight requests
  const existingRequest = inflightRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest as Promise<ApiResponse<T>>;
  }

  // 3. Create the actual fetch promise
  const fetchPromise = doApiFetch<T>(endpoint, cacheKey);

  // Register in-flight and clean up when done
  inflightRequests.set(cacheKey, fetchPromise);
  fetchPromise
    .catch(() => {}) // Prevent unhandled rejection on this side-branch
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  return fetchPromise;
}

async function doApiFetch<T>(
  endpoint: string,
  cacheKey: string
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const keyManager = getKeyManager();
  let lastError: Error | null = null;

  // Try up to MAX_RETRY_KEYS different keys
  for (let attempt = 0; attempt < MAX_RETRY_KEYS; attempt++) {
    const apiKey = keyManager.getNextKey();

    if (!apiKey) {
      // No more keys — break out and let the allKeysExhausted error fire below
      lastError = new Error('All API keys are exhausted or in cooldown. No keys available.');
      break;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'x-apisports-key': apiKey,
        },
        next: { revalidate: 600 },
      });

      // Handle HTTP-level rate limit
      if (res.status === 429) {
        console.log(
          `[API] 429 rate limit on attempt ${attempt + 1}/${MAX_RETRY_KEYS}`
        );
        keyManager.markRateLimited(apiKey);
        lastError = new Error('API rate limit exceeded (429)');
        continue; // Try next key
      }

      if (!res.ok) {
        // Non-200 but not 429 — treat as key failure and try next
        lastError = new Error(`API request failed: ${res.status} ${res.statusText}`);
        keyManager.markExhausted(apiKey);
        continue;
      }

      const data: ApiResponse<T> = await res.json();

      // Handle API-level rate limit / quota errors in response body
      if (
        data.errors &&
        typeof data.errors === 'object' &&
        !Array.isArray(data.errors) &&
        'requests' in data.errors
      ) {
        console.log(
          `[API] Quota exceeded in response on attempt ${attempt + 1}/${MAX_RETRY_KEYS}`
        );
        keyManager.markExhausted(apiKey);
        lastError = new Error('API daily quota exceeded');
        continue; // Try next key
      }

      // Handle token/auth errors (invalid or missing API key) — per-key failure
      if (
        data.errors &&
        typeof data.errors === 'object' &&
        !Array.isArray(data.errors) &&
        'token' in data.errors
      ) {
        console.log(
          `[API] Token/auth error on attempt ${attempt + 1}/${MAX_RETRY_KEYS} — marking key invalid`
        );
        keyManager.markExhausted(apiKey);
        lastError = new Error(`API key invalid: ${JSON.stringify(data.errors)}`);
        continue; // Try next key
      }

      // Other API-level errors (non-key-related) — array form
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        lastError = new Error(`API error: ${data.errors.join(', ')}`);
        continue;
      }

      // Other API-level errors — object form
      if (
        data.errors &&
        typeof data.errors === 'object' &&
        Object.keys(data.errors).length > 0
      ) {
        lastError = new Error(`API error: ${JSON.stringify(data.errors)}`);
        keyManager.markExhausted(apiKey);
        continue;
      }

      // Success — mark key as used and cache the result
      keyManager.markUsed(apiKey);
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      // Network-level errors — retryable
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // All retries exhausted — always tag with allKeysExhausted so fallback fires
  const finalError = lastError || new Error('API fetch failed after all retry attempts');
  (finalError as Error & { allKeysExhausted?: boolean }).allKeysExhausted = true;
  throw finalError;

}

// =========================================
// API Functions
// =========================================

import { getESPNMatchesByDate, getESPNLiveMatches } from './espn-api';

/**
 * Get all matches for a given date (YYYY-MM-DD)
 * 1. ESPN (Primary, no limits)
 * 2. football-data.org (Secondary)
 * 3. api-football.com (Tertiary)
 */
export async function getMatchesByDate(
  date: string
): Promise<ProcessedMatch[]> {
  try {
    // 1. Try ESPN first
    console.log(`[API] Fetching from ESPN (Primary) for date: ${date}`);
    const espnMatches = await getESPNMatchesByDate(date);
    // Even if empty, return it because ESPN is reliable for covered leagues
    return espnMatches;
  } catch (espnError) {
    console.warn(`[API] ESPN failed, failing over to football-data.org (Secondary)`, espnError);
    
    // 2. Try football-data.org
    try {
      return await getFallbackMatchesByDate(date);
    } catch (fallbackError) {
      console.warn(`[API] football-data.org failed, failing over to api-football.com (Tertiary)`, fallbackError);
      
      // 3. Try api-football
      try {
        const data = await apiFetch<Fixture>(`/fixtures?date=${date}&timezone=Asia/Kolkata`);
        const processed = data.response.map(processFixture);
        return sortMatchesByLeaguePriority(processed);
      } catch (finalError) {
        console.error('getMatchesByDate all providers failed:', finalError);
        return [];
      }
    }
  }
}

import { getESPNMatchById } from './espn-api';

/**
 * Get detailed match info by fixture ID — with fallback support
 */
export async function getMatchById(id: number): Promise<Fixture | null> {
  try {
    // 1. Try ESPN first (since home page uses ESPN IDs)
    const espnFixture = await getESPNMatchById(id);
    if (espnFixture) return espnFixture;
  } catch (espnError) {
    console.warn(`[API] ESPN match detail failed, trying fallback to api-football for ID ${id}`);
  }

  // 2. Try api-football (legacy IDs or tertiary fallback)
  try {
    const data = await apiFetch<Fixture>(`/fixtures?id=${id}`);
    return data.response[0] || null;
  } catch (error) {
    const isExhausted =
      (error as Error & { allKeysExhausted?: boolean }).allKeysExhausted === true ||
      (error instanceof Error &&
        (error.message.includes('exhausted') ||
          error.message.includes('No keys available')));

    if (isExhausted) {
      console.warn('[API] Primary keys exhausted — trying fallback for match detail');
      return null;
    }

    console.error('getMatchById error:', error);
    return null;
  }
}

/**
 * Get match events (goals, cards, substitutions)
 */
export async function getMatchEvents(id: number): Promise<MatchEvent[]> {
  try {
    const data = await apiFetch<MatchEvent>(
      `/fixtures/events?fixture=${id}`
    );
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
    const data = await apiFetch<Lineup>(
      `/fixtures/lineups?fixture=${id}`
    );
    return data.response;
  } catch (error) {
    console.error('getMatchLineups error:', error);
    return [];
  }
}

/**
 * Get match statistics
 */
export async function getMatchStatistics(
  id: number
): Promise<MatchStatistics[]> {
  try {
    const data = await apiFetch<MatchStatistics>(
      `/fixtures/statistics?fixture=${id}`
    );
    return data.response;
  } catch (error) {
    console.error('getMatchStatistics error:', error);
    return [];
  }
}

/**
 * Get head-to-head fixtures between two teams
 */
export async function getHeadToHead(
  team1: number,
  team2: number
): Promise<Fixture[]> {
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
export async function getStandings(
  league: number,
  season: number
): Promise<StandingsGroup | null> {
  try {
    const data = await apiFetch<StandingsGroup>(
      `/standings?league=${league}&season=${season}`
    );
    return data.response[0] || null;
  } catch (error) {
    console.error('getStandings error:', error);
    return null;
  }
}

/**
 * Get all currently live matches
 * 1. ESPN (Primary)
 * 2. football-data.org (Secondary)
 * 3. api-football.com (Tertiary)
 */
export async function getLiveMatches(): Promise<ProcessedMatch[]> {
  try {
    // 1. Try ESPN first
    console.log(`[API] Fetching LIVE matches from ESPN (Primary)`);
    const espnMatches = await getESPNLiveMatches();
    return espnMatches;
  } catch (espnError) {
    console.warn(`[API] ESPN failed for live matches, failing over to football-data.org (Secondary)`, espnError);
    
    // 2. Try football-data.org
    try {
      return await getFallbackLiveMatches();
    } catch (fallbackError) {
      console.warn(`[API] football-data.org failed for live matches, failing over to api-football.com (Tertiary)`, fallbackError);
      
      // 3. Try api-football
      try {
        const data = await apiFetch<Fixture>('/fixtures?live=all');
        const processed = data.response.map(processFixture);
        return sortMatchesByLeaguePriority(processed);
      } catch (finalError) {
        console.error('getLiveMatches all providers failed:', finalError);
        return [];
      }
    }
  }
}

/**
 * Get all match detail data in one call (for match detail page)
 */
export async function getFullMatchData(id: number) {
  try {
    const [fixture, events, lineups, statistics] =
      await Promise.allSettled([
        getMatchById(id),
        getMatchEvents(id),
        getMatchLineups(id),
        getMatchStatistics(id),
      ]);

    return {
      fixture: fixture.status === 'fulfilled' ? fixture.value : null,
      events: events.status === 'fulfilled' ? events.value : [],
      lineups: lineups.status === 'fulfilled' ? lineups.value : [],
      statistics:
        statistics.status === 'fulfilled' ? statistics.value : [],
    };
  } catch (error) {
    console.error('getFullMatchData error:', error);
    return { fixture: null, events: [], lineups: [], statistics: [] };
  }
}
