'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ProcessedMatch } from '@/lib/types';
import { formatDate, getDateForFilter, formatDisplayDate } from '@/lib/utils';
import MatchList from './MatchList';
import LoadingSkeleton from './LoadingSkeleton';
import AdBanner from './AdBanner';
import StandingsWidget from './StandingsWidget';
import { getMsUntilNextUtcSlot } from '@/lib/constants';

type Filter = 'yesterday' | 'today' | 'tomorrow';

interface MatchListWrapperProps {
  initialMatches: ProcessedMatch[];
  initialDate: string;
  leagueId?: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch matches');
  const data = await res.json();
  return data.matches as ProcessedMatch[];
};

export default function MatchListWrapper({ initialMatches, initialDate, leagueId }: MatchListWrapperProps = {} as MatchListWrapperProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('today');

  // UTC-aligned refresh interval
  const [refreshInterval, setRefreshInterval] = useState(() => getMsUntilNextUtcSlot());

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshInterval(getMsUntilNextUtcSlot());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const selectedDate = formatDate(getDateForFilter(activeFilter));

  const { data: matches, isLoading } = useSWR<ProcessedMatch[]>(
    `/api/matches/${selectedDate}`,
    fetcher,
    {
      fallbackData: activeFilter === 'today' ? initialMatches : undefined,
      refreshInterval,
      revalidateOnFocus: false,
    }
  );

  const tabs: { filter: Filter; label: string }[] = [
    { filter: 'yesterday', label: 'Yesterday' },
    { filter: 'today', label: 'Today' },
    { filter: 'tomorrow', label: 'Tomorrow' },
  ];

  const filteredMatches = matches
    ? (leagueId ? matches.filter(m => m.league.id === leagueId) : matches)
    : [];

  return (
    <div className="flex gap-6 lg:gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Date Selector Tabs */}
        <div className="bg-secondary/50 rounded-xl p-1.5 flex gap-1 mb-5 border border-white/5">
          {tabs.map(({ filter, label }) => {
            const date = getDateForFilter(filter);
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'tab-active shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                aria-pressed={isActive}
                aria-label={`Show ${label} matches - ${formatDisplayDate(date)}`}
              >
                <span className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>{label}</span>
                <span className={`text-[11px] mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                  {formatDisplayDate(date)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Matches Content */}
        {isLoading ? (
          <div className="space-y-3">
            <LoadingSkeleton type="league" count={3} />
            <LoadingSkeleton type="league" count={3} />
            <LoadingSkeleton type="league" count={2} />
          </div>
        ) : (
          <MatchList matches={filteredMatches} />
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
        <StandingsWidget />
        <AdBanner slot="sidebar" />
      </aside>
    </div>
  );
}
