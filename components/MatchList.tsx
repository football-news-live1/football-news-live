'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ProcessedMatch } from '@/lib/types';
import { isLive } from '@/lib/utils';
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

  // Group by status (Live vs Scheduled/Finished) and then by league — memoized
  const sections = useMemo(() => {
    const liveMatches = matches.filter(m => isLive(m.statusShort));
    const nonLiveMatches = matches.filter(m => !isLive(m.statusShort));

    const result: { title: string | null; icon?: string; isLiveSection?: boolean; groups: LeagueGroup[] }[] = [];

    // 1. All Live matches in one dedicated section at the top (if any)
    if (liveMatches.length > 0) {
      const liveGroups = new Map<number, LeagueGroup>();
      for (const match of liveMatches) {
        if (!liveGroups.has(match.league.id)) {
          liveGroups.set(match.league.id, {
            leagueId: match.league.id,
            leagueName: match.league.name,
            leagueLogo: match.league.logo,
            country: match.league.country,
            flag: match.league.flag,
            round: match.league.round,
            matches: [],
          });
        }
        liveGroups.get(match.league.id)!.matches.push(match);
      }
      result.push({
        title: 'LIVE NOW',
        isLiveSection: true,
        groups: Array.from(liveGroups.values()),
      });
    }

    // 2. Remaining matches grouped by league as usual
    if (nonLiveMatches.length > 0) {
      const otherGroups = new Map<number, LeagueGroup>();
      for (const match of nonLiveMatches) {
        if (!otherGroups.has(match.league.id)) {
          otherGroups.set(match.league.id, {
            leagueId: match.league.id,
            leagueName: match.league.name,
            leagueLogo: match.league.logo,
            country: match.league.country,
            flag: match.league.flag,
            round: match.league.round,
            matches: [],
          });
        }
        otherGroups.get(match.league.id)!.matches.push(match);
      }
      result.push({
        title: null, // Regular groupings don't need a special top-level title
        groups: Array.from(otherGroups.values()),
      });
    }

    return result;
  }, [matches]);

  const toggleLeague = (leagueId: number) => {
    setCollapsedLeagues((prev) => {
      const next = new Set(prev);
      if (next.has(leagueId)) next.delete(leagueId);
      else next.add(leagueId);
      return next;
    });
  };

  return (
    <div className="space-y-8 match-list-container">
      {sections.map((section, sectionIndex) => (
        <div key={section.title || `section-${sectionIndex}`} className="space-y-4">
          {section.title && (
            <div className="flex items-center gap-2 px-1">
              <span className="live-dot w-2 h-2"></span>
              <h2 className="text-sm font-bold tracking-wider text-highlight uppercase">{section.title}</h2>
            </div>
          )}

          <div className="space-y-3">
            {section.groups.map((group, groupIndex) => {
              const isCollapsed = collapsedLeagues.has(group.leagueId);
              const totalLeagueGroups = sections.reduce((acc, s) => acc + s.groups.length, 0);
              const globalIndex = sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.groups.length, 0) + groupIndex;

              return (
                <div key={group.leagueId}>
                  {/* In-feed ad every 5 leagues globally */}
                  {globalIndex > 0 && globalIndex % 5 === 0 && (
                    <div className="mb-3">
                      <AdBanner slot="in-feed" index={Math.floor(globalIndex / 5)} />
                    </div>
                  )}

                  {/* League Section */}
                  <div
                    id={`league-${group.leagueId}`}
                    className={`rounded-xl overflow-hidden border ${
                      section.isLiveSection ? 'border-highlight/30 bg-highlight/5' : 'border-white/5 bg-secondary/50'
                    } league-section`}
                    role="region"
                    aria-label={`${group.leagueName} matches`}
                  >
                    {/* League Header */}
                    <button
                      className={`w-full flex items-center justify-between px-4 py-3 ${
                        section.isLiveSection ? 'bg-highlight/10' : 'bg-accent/20'
                      } hover:bg-accent/30 transition-colors group`}
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
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          section.isLiveSection ? 'bg-highlight/20 text-highlight' : 'bg-white/5 text-gray-400'
                        }`}>
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
        </div>
      ))}
    </div>
  );
}
