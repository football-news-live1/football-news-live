// League priority rankings for sorting match lists
export const LEAGUE_PRIORITY: Record<number, number> = {
  1: 1,    // FIFA World Cup
  2: 2,    // UEFA Champions League
  3: 3,    // UEFA Europa League
  4: 4,    // UEFA Euro Championship
  9: 5,    // Copa America
  39: 6,   // English Premier League
  140: 7,  // La Liga
  78: 8,   // Bundesliga
  135: 9,  // Serie A
  61: 10,  // Ligue 1
  5: 11,   // UEFA Nations League
  6: 12,   // Africa Cup of Nations
  848: 13, // UEFA Conference League
  45: 14,  // FA Cup
  48: 15,  // Carabao Cup
  88: 16,  // Eredivisie
  94: 17,  // Primeira Liga
  203: 18, // Super Lig
  144: 19, // Belgian Pro League
  71: 20,  // Brasileirao
  128: 21, // Argentine Liga Profesional
};

export const API_BASE_URL = 'https://v3.football.api-sports.io';

export const CACHE_DURATION = 60 * 1000; // 1 minute in ms
export const LIVE_POLL_INTERVAL = 30 * 1000; // 30 seconds
export const MATCHES_POLL_INTERVAL = 60 * 1000; // 1 minute

// UTC-aligned interval for deterministic caching if needed
export const UTC_INTERVAL_MS = 60_000; // 1 minute in ms

/** Returns the current UTC slot number (increments every 10 minutes) */
export function getCurrentUtcSlot(): number {
  return Math.floor(Date.now() / UTC_INTERVAL_MS);
}

/** Returns ms until the next UTC 10-minute boundary */
export function getMsUntilNextUtcSlot(): number {
  const now = Date.now();
  const nextSlot = (Math.floor(now / UTC_INTERVAL_MS) + 1) * UTC_INTERVAL_MS;
  return Math.max(nextSlot - now, 1000); // minimum 1 second
}

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Football News Live';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballnewslive.online';

// API Key Management
export const MAX_REQUESTS_PER_KEY_PER_DAY = 95; // Leave 5 as buffer from 100 daily limit
export const KEY_COOLDOWN_MS = 60_000;           // 1 minute cooldown on 429 rate limit
export const MAX_RETRY_KEYS = 5;                  // Try up to 5 different keys before giving up (covers all free-tier keys)

export const STATUS_LABELS: Record<string, string> = {
  'NS': 'Not Started',
  'LIVE': 'Live',
  '1H': 'First Half',
  'HT': 'Half Time',
  '2H': 'Second Half',
  'ET': 'Extra Time',
  'BT': 'Break Time',
  'P': 'Penalty',
  'SUSP': 'Suspended',
  'INT': 'Interrupted',
  'FT': 'Full Time',
  'AET': 'After Extra Time',
  'PEN': 'Penalty Shootout',
  'PST': 'Postponed',
  'CANC': 'Cancelled',
  'ABD': 'Abandoned',
  'AWD': 'Technical Loss',
  'WO': 'Walkover',
  'LIVE-ET': 'Extra Time',
};

export const LIVE_STATUSES = ['LIVE', '1H', 'HT', '2H', 'ET', 'BT', 'P'];
export const FINISHED_STATUSES = ['FT', 'AET', 'PEN', 'AWD', 'WO'];

export const EVENT_ICONS: Record<string, string> = {
  'Goal': '⚽',
  'Own Goal': '⚽',
  'Penalty': '⚽',
  'Missed Penalty': '❌',
  'Yellow Card': '🟨',
  'Second Yellow card': '🟥',
  'Red Card': '🟥',
  'Subst': '🔄',
  'Var': '📺',
};
