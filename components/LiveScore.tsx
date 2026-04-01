'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { ProcessedMatch } from '@/lib/types';
import { getMatchStatusDisplay } from '@/lib/utils';
import { getMsUntilNextUtcSlot } from '@/lib/constants';
import LoadingSkeleton from './LoadingSkeleton';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch live matches');
  const data = await res.json();
  return data.matches as ProcessedMatch[];
};

interface LiveScoreProps {
  leagueId?: number;
}

export default function LiveScore({ leagueId }: LiveScoreProps = {}) {
  // Calculate UTC-aligned refresh interval
  const [refreshInterval, setRefreshInterval] = useState(() => getMsUntilNextUtcSlot());

  // Re-calculate interval after each refresh to stay aligned
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshInterval(getMsUntilNextUtcSlot());
    }, 60_000); // Re-check every minute
    return () => clearInterval(timer);
  }, []);

  const { data: liveMatches, isLoading } = useSWR<ProcessedMatch[]>(
    '/api/live',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton w-3 h-3 rounded-full" />
          <div className="skeleton h-5 w-24 rounded" />
        </div>
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  const filteredLiveMatches = liveMatches
    ? (leagueId ? liveMatches.filter(m => m.league.id === leagueId) : liveMatches)
    : [];

  if (!filteredLiveMatches || filteredLiveMatches.length === 0) return null;

  return (
    <section className="mb-6 animate-fade-in" aria-label="Live matches">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="live-dot"></span>
          <h2 className="text-lg font-bold text-white">
            <span className="text-highlight">LIVE NOW</span>
            <span className="ml-2 text-sm text-gray-400 font-normal">({filteredLiveMatches.length} match{filteredLiveMatches.length !== 1 ? 'es' : ''})</span>
          </h2>
        </div>
        <span className="text-[11px] text-gray-500">Auto-refreshes every 10m</span>
      </div>

      {/* Live Match Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredLiveMatches.slice(0, 6).map((match) => (
          <Link
            key={match.id}
            href={`/match/${match.slug}`}
            className="match-card block bg-card border border-highlight/20 rounded-xl px-4 py-3 live-pulse ring-1 ring-highlight/30"
            aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name} - LIVE`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-highlight uppercase flex items-center gap-1">
                <span className="live-dot" style={{ width: 6, height: 6 }}></span>
                {getMatchStatusDisplay(match)}
              </span>
              <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{match.league.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative w-7 h-7 flex-shrink-0">
                  <Image
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    fill
                    sizes="28px"
                    className="object-contain"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }}
                  />
                </div>
                <span className="text-sm font-semibold text-white truncate">{match.homeTeam.name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-mono font-bold text-white text-lg">{match.homeScore ?? 0}</span>
                <span className="text-gray-500">-</span>
                <span className="font-mono font-bold text-white text-lg">{match.awayScore ?? 0}</span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className="text-sm font-semibold text-white truncate">{match.awayTeam.name}</span>
                <div className="relative w-7 h-7 flex-shrink-0">
                  <Image
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    fill
                    sizes="28px"
                    className="object-contain"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredLiveMatches.length > 6 && (
        <p className="text-center text-xs text-gray-500 mt-2">
          +{filteredLiveMatches.length - 6} more live matches below
        </p>
      )}

      <div className="border-b border-white/10 mt-5" />
    </section>
  );
}
