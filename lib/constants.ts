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

export const CACHE_DURATION = 600 * 1000; // 10 minutes in ms

export const LIVE_POLL_INTERVAL = 600 * 1000; // 10 minutes

export const MATCHES_POLL_INTERVAL = 600 * 1000; // 10 minutes

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'FootballLive';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballlive.com';

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
