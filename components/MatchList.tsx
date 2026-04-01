'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProcessedMatch } from '@/lib/types';
import MatchCard from './MatchCard';
import AdBanner from './AdBanner';
import LeagueBadge from './LeagueBadge';

interface MatchListProps {
  matches: ProcessedMatch[];
}

interface LeagueGroup {
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  country: string;
  flag: string | null;
  round: string;
  matches: ProcessedMatch[];
}

export default function MatchList({ matches }: MatchListProps) {
  const [collapsedLeagues, setCollapsedLeagues] = useState<Set<number>>(new Set());

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">🏟️</span>
        <h3 className="text-xl font-semibold text-white mb-2">No Matches Found</h3>
        <p className="text-gray-400 text-sm">There are no matches scheduled for this date.</p>
      </div>
    );
  }

  // Group by league maintaining priority order
  const seenLeagues = new Map<number, LeagueGroup>();
  for (const match of matches) {
    if (!seenLeagues.has(match.league.id)) {
      seenLeagues.set(match.league.id, {
        leagueId: match.league.id,
        leagueName: match.league.name,
        leagueLogo: match.league.logo,
        country: match.league.country,
        flag: match.league.flag,
        round: match.league.round,
        matches: [],
      });
    }
    seenLeagues.get(match.league.id)!.matches.push(match);
  }

  const leagueGroups = Array.from(seenLeagues.values());

  const toggleLeague = (leagueId: number) => {
    setCollapsedLeagues((prev) => {
      const next = new Set(prev);
      if (next.has(leagueId)) next.delete(leagueId);
      else next.add(leagueId);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {leagueGroups.map((group, groupIndex) => {
        const isCollapsed = collapsedLeagues.has(group.leagueId);
        return (
          <div key={group.leagueId}>
            {/* In-feed ad every 5 leagues */}
            {groupIndex > 0 && groupIndex % 5 === 0 && (
              <AdBanner slot="in-feed" index={Math.floor(groupIndex / 5)} />
            )}

            {/* League Section */}
            <div
              id={`league-${group.leagueId}`}
              className="rounded-xl overflow-hidden border border-white/5 bg-secondary/50"
            >
              {/* League Header */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/30 transition-colors group"
                onClick={() => toggleLeague(group.leagueId)}
                aria-expanded={!isCollapsed}
                aria-controls={`league-content-${group.leagueId}`}
              >
                <LeagueBadge
                  name={group.leagueName}
                  logo={group.leagueLogo}
                  country={group.country}
                  flag={group.flag}
                  round={group.round}
                />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded-full">
                    {group.matches.length} match{group.matches.length !== 1 ? 'es' : ''}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* League Matches */}
              {!isCollapsed && (
                <div id={`league-content-${group.leagueId}`} className="divide-y divide-white/5">
                  {group.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
