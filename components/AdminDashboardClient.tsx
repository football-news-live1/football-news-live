'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ProcessedMatch } from '@/lib/types';
import { formatDate, getDateForFilter, formatDisplayDate } from '@/lib/utils';
import AdminMatchCard from './AdminMatchCard';
import LoadingSkeleton from './LoadingSkeleton';

type Filter = 'yesterday' | 'today' | 'tomorrow';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return data.matches as ProcessedMatch[];
};

const linksFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) return {};
  const data = await res.json();
  return (data.links || {}) as Record<string, string>;
};

export default function AdminDashboardClient() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>('today');
  const [authChecked, setAuthChecked] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const selectedDate = formatDate(getDateForFilter(activeFilter));

  const { data: matches, isLoading } = useSWR<ProcessedMatch[]>(
    `/api/matches/${selectedDate}`,
    fetcher,
    { refreshInterval: 600000, revalidateOnFocus: false }
  );

  const { data: allLinks = {} } = useSWR<Record<string, string>>(
    '/api/admin/links',
    linksFetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // Verify admin auth on mount
  useEffect(() => {
    fetch('/api/admin/links')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/panel-br');
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace('/panel-br'));
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/panel-br');
  };

  const tabs: { filter: Filter; label: string }[] = [
    { filter: 'yesterday', label: 'Yesterday' },
    { filter: 'today', label: 'Today' },
    { filter: 'tomorrow', label: 'Tomorrow' },
  ];

  // Group by league
  const leagueGroups = (() => {
    if (!matches) return [];
    const map = new Map<number, { name: string; logo: string; country: string; matches: ProcessedMatch[] }>();
    for (const m of matches) {
      if (!map.has(m.league.id)) {
        map.set(m.league.id, { name: m.league.name, logo: m.league.logo, country: m.league.country, matches: [] });
      }
      map.get(m.league.id)!.matches.push(m);
    }
    return Array.from(map.values());
  })();

  if (!authChecked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          Verifying session…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Admin Header Bar */}
      <div className="flex items-center justify-between mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div>
            <h1 className="text-white font-bold text-base font-['Poppins']">Admin Dashboard</h1>
            <p className="text-amber-400/70 text-xs">Click any match to edit its Watch Live redirect link</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="text-xs text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          {logoutLoading ? '…' : '🚪 Logout'}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-white/5 rounded-xl px-4 py-3 text-center">
          <div className="text-2xl font-bold text-white">{Object.keys(allLinks).length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Custom Links Set</div>
        </div>
        <div className="bg-card border border-white/5 rounded-xl px-4 py-3 text-center">
          <div className="text-2xl font-bold text-white">{matches?.length ?? '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">Matches Today</div>
        </div>
        <div className="bg-card border border-white/5 rounded-xl px-4 py-3 text-center">
          <div className="text-2xl font-bold text-white">{matches?.filter(m => m.statusShort === '1H' || m.statusShort === '2H' || m.statusShort === 'HT').length ?? '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">Live Now</div>
        </div>
      </div>

      {/* Date Tabs */}
      <div className="bg-secondary/50 rounded-xl p-1.5 flex gap-1 mb-5 border border-white/5">
        {tabs.map(({ filter, label }) => {
          const date = getDateForFilter(filter);
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive ? 'tab-active shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>{label}</span>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                {formatDisplayDate(date)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Match List */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="league" count={3} />
          <LoadingSkeleton type="league" count={3} />
        </div>
      ) : leagueGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl mb-4">🏟️</span>
          <h3 className="text-xl font-semibold text-white mb-2">No Matches Found</h3>
          <p className="text-gray-400 text-sm">No matches scheduled for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leagueGroups.map((group) => (
            <div key={group.name} className="rounded-xl overflow-hidden border border-white/5 bg-secondary/50">
              {/* League header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-accent/20 border-b border-white/5">
                <span className="text-sm font-semibold text-white">{group.name}</span>
                <span className="text-xs text-gray-500">{group.country}</span>
                <span className="ml-auto text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {group.matches.length} match{group.matches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              {/* Match cards */}
              <div className="divide-y divide-white/5">
                {group.matches.map((m) => (
                  <AdminMatchCard
                    key={m.id}
                    match={m}
                    customLink={allLinks[String(m.id)] || null}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
