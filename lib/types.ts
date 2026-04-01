// TypeScript interfaces for all API-Football data structures

export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[] | Record<string, string>;
  results: number;
  paging: { current: number; total: number };
  response: T[];
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface Score {
  halftime: Goals;
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
}

export interface FixtureVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
}

export interface FixtureInfo {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: { first: number | null; second: number | null };
  venue: FixtureVenue;
  status: FixtureStatus;
}

export interface Fixture {
  fixture: FixtureInfo;
  league: League;
  teams: { home: Team; away: Team };
  goals: Goals;
  score: Score;
}

export interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface PlayerInLineup {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

export interface CoachInLineup {
  id: number;
  name: string;
  photo: string;
}

export interface Lineup {
  team: { id: number; name: string; logo: string; colors: { player: { primary: string; number: string; border: string }; goalkeeper: { primary: string; number: string; border: string } } | null };
  coach: CoachInLineup;
  formation: string;
  startXI: { player: PlayerInLineup }[];
  substitutes: { player: PlayerInLineup }[];
}

export interface StatisticValue {
  type: string;
  value: string | number | null;
}

export interface MatchStatistics {
  team: { id: number; name: string; logo: string };
  statistics: StatisticValue[];
}

export interface Standing {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  update: string;
}

export interface StandingsGroup {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    standings: Standing[][];
  };
}

export type TabType = 'summary' | 'lineups' | 'statistics' | 'h2h' | 'standings';
export type DateFilter = 'yesterday' | 'today' | 'tomorrow';

export interface ProcessedMatch {
  id: number;
  homeTeam: { id: number; name: string; logo: string };
  awayTeam: { id: number; name: string; logo: string };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  statusShort: string;
  elapsed: number | null;
  date: string;
  timestamp: number;
  league: { id: number; name: string; logo: string; country: string; flag: string | null; round: string };
  venue: string | null;
  referee: string | null;
  slug: string;
}
