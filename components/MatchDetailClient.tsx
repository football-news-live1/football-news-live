'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProcessedMatch, Fixture, MatchEvent, Lineup, MatchStatistics, StandingsGroup } from '@/lib/types';
import { formatFullDateTime, isLive, getMatchStatusDisplay } from '@/lib/utils';
import MatchTimeline from './MatchTimeline';
import LineupDisplay from './LineupDisplay';
import StatisticsDisplay from './StatisticsDisplay';
import HeadToHead from './HeadToHead';
import StandingsTable from './StandingsTable';
import AdBanner from './AdBanner';

type TabType = 'summary' | 'lineups' | 'statistics' | 'h2h' | 'standings';

interface MatchDetailClientProps {
  match: ProcessedMatch;
  fixture: Fixture;
  events: MatchEvent[];
  lineups: Lineup[];
  statistics: MatchStatistics[];
  h2h: Fixture[];
  standings: StandingsGroup | null;
  // Admin-specific props
  isAdmin?: boolean;
  matchId?: number;
  // Fallback data notice
  isFallback?: boolean;
}

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'summary', label: 'Summary', icon: '📋' },
  { key: 'lineups', label: 'Lineups', icon: '👥' },
  { key: 'statistics', label: 'Statistics', icon: '📊' },
  { key: 'h2h', label: 'Head to Head', icon: '🤝' },
  { key: 'standings', label: 'Standings', icon: '🏆' },
];

export default function MatchDetailClient({
  match,
  fixture,
  events,
  lineups,
  statistics,
  h2h,
  standings,
  isAdmin = false,
  matchId,
  isFallback = false,
}: MatchDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [hasSeenAd, setHasSeenAd] = useState(false);
  const [hasClickedAdBackground, setHasClickedAdBackground] = useState(false);

  // Custom link state (used by both user & admin)
  const [customLink, setCustomLink] = useState<string | null>(null);
  const [customLinkLoaded, setCustomLinkLoaded] = useState(false);

  // Admin: edit-link modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLinkInput, setEditLinkInput] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const live = isLive(match.statusShort);
  const statusDisplay = getMatchStatusDisplay(match);

  // Fetch the custom watch link on mount
  useEffect(() => {
    if (!matchId) {
      setCustomLinkLoaded(true);
      return;
    }
    fetch(`/api/watch-link/${matchId}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomLink(data.url || null);
        setEditLinkInput(data.url || '');
      })
      .catch(() => {})
      .finally(() => setCustomLinkLoaded(true));
  }, [matchId]);

  // Ad popup countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showAdPopup && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (showAdPopup && adTimer <= 0) {
      setHasSeenAd(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showAdPopup, adTimer]);

  // Resolve the final URL to redirect to
  const getRedirectUrl = () => {
    if (customLink) return customLink;
    const query = encodeURIComponent(`${match.homeTeam.name} vs ${match.awayTeam.name} live stream`);
    return `https://www.google.com/search?q=${query}`;
  };

  const handleWatchLiveClick = () => {
    if (isAdmin) {
      // Admins skip the ad and redirect directly
      window.open(getRedirectUrl(), '_blank', 'noopener,noreferrer');
      return;
    }
    if (hasSeenAd) {
      window.open(getRedirectUrl(), '_blank', 'noopener,noreferrer');
    } else {
      setShowAdPopup(true);
      setAdTimer(5);
    }
  };

  const handleClosePopup = () => {
    setHasSeenAd(true);
    setShowAdPopup(false);
    // Redirect when close is clicked after ad is seen
    window.open(getRedirectUrl(), '_blank', 'noopener,noreferrer');
  };

  // Admin: save link
  const handleSaveLink = async () => {
    if (!matchId) return;
    setEditSaving(true);
    setEditMsg(null);
    try {
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: String(matchId), url: editLinkInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomLink(editLinkInput.trim());
        setEditMsg({ type: 'success', text: '✅ Link saved successfully!' });
        setTimeout(() => setShowEditModal(false), 1200);
      } else {
        setEditMsg({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch {
      setEditMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setEditSaving(false);
    }
  };

  // Admin: clear link (revert to Google search)
  const handleClearLink = async () => {
    if (!matchId) return;
    setEditSaving(true);
    setEditMsg(null);
    try {
      const res = await fetch('/api/admin/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: String(matchId) }),
      });
      if (res.ok) {
        setCustomLink(null);
        setEditLinkInput('');
        setEditMsg({ type: 'success', text: '✅ Link cleared. Will use Google search.' });
        setTimeout(() => setShowEditModal(false), 1200);
      } else {
        setEditMsg({ type: 'error', text: 'Failed to clear link.' });
      }
    } catch {
      setEditMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setEditSaving(false);
    }
  };

  const breadcrumbBase = isAdmin ? '/panel-br' : '/';
  const leagueHref = isAdmin ? `/panel-br` : `/#league-${match.league.id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Fallback Data Notice */}
      {isFallback && (
        <div className="mb-4 flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5">
          <span className="text-blue-400 text-sm">ℹ️ Limited data — match sourced from alternate provider. Events, lineups, and statistics may not be available.</span>
        </div>
      )}

      {/* Admin Bar */}
      {isAdmin && (
        <div className="mb-4 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
          <span className="text-amber-400 text-sm font-bold">🔐 Admin Mode</span>
          <span className="text-amber-400/70 text-xs">Changes to the Watch Live link affect all users instantly.</span>
          <Link href="/panel-br" className="ml-auto text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2">
            ← Back to Dashboard
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li><Link href={breadcrumbBase} className="hover:text-white transition-colors">Home</Link></li>
          <li><span className="text-gray-600">/</span></li>
          <li><Link href={leagueHref} className="hover:text-white transition-colors">{match.league.name}</Link></li>
          <li><span className="text-gray-600">/</span></li>
          <li className="text-white font-medium truncate">{match.homeTeam.name} vs {match.awayTeam.name}</li>
        </ol>
      </nav>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Match Header Card */}
          <div className="bg-card rounded-2xl border border-white/10 overflow-hidden mb-4">
            {/* Competition */}
            <div className="flex items-center gap-3 px-6 py-3 bg-accent/20 border-b border-white/10">
              <div className="relative w-6 h-6">
                <Image src={match.league.logo} alt={match.league.name} fill className="object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/images/league-placeholder.webp'; }} />
              </div>
              <span className="text-sm font-semibold text-white">{match.league.name}</span>
              <span className="text-xs text-gray-400">— {match.league.round}</span>
              {live && (
                <span className="ml-auto flex items-center gap-1.5 bg-highlight/20 border border-highlight/30 rounded-full px-3 py-1">
                  <span className="live-dot" style={{ width: 6, height: 6 }} />
                  <span className="text-xs font-bold text-highlight">LIVE {statusDisplay}</span>
                </span>
              )}
              {!live && match.statusShort !== 'NS' && (
                <span className="ml-auto text-sm font-bold text-gray-300 bg-white/10 px-3 py-1 rounded-full">{match.statusShort}</span>
              )}
            </div>

            {/* Score Display */}
            <div className="px-6 py-8">
              <div className="flex items-center justify-between gap-4">
                {/* Home Team */}
                <div className="flex-1 flex flex-col items-center gap-3 text-center">
                  <div className="relative w-20 h-20 md:w-24 md:h-24">
                    <Image
                      src={match.homeTeam.logo}
                      alt={`${match.homeTeam.name} logo`}
                      fill
                      sizes="96px"
                      className="object-contain drop-shadow-lg"
                      priority
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }}
                    />
                  </div>
                  <h1 className="text-lg md:text-xl font-bold text-white text-center leading-tight">
                    {match.homeTeam.name}
                  </h1>
                </div>

                {/* Center Score */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[120px] md:min-w-[160px]">
                  {(match.homeScore !== null && match.awayScore !== null) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-5xl md:text-6xl font-mono font-black text-white">{match.homeScore}</span>
                      <span className="text-3xl font-mono text-gray-500">-</span>
                      <span className="text-5xl md:text-6xl font-mono font-black text-white">{match.awayScore}</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-mono font-bold text-gray-400">
                      {match.statusShort === 'NS' ? formatFullDateTime(match.date).split(' ').slice(-1)[0] : 'vs'}
                    </div>
                  )}

                  <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${live ? 'bg-highlight/20 text-highlight' : 'bg-white/10 text-gray-300'}`}>
                    {live ? `LIVE ${statusDisplay}` : match.statusShort === 'NS' ? 'Not Started' : statusDisplay}
                  </div>

                  {/* Half-time score */}
                  {fixture?.score?.halftime?.home !== null && fixture?.score?.halftime?.home !== undefined && (
                    <p className="text-xs text-gray-500">
                      HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
                    </p>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex-1 flex flex-col items-center gap-3 text-center">
                  <div className="relative w-20 h-20 md:w-24 md:h-24">
                    <Image
                      src={match.awayTeam.logo}
                      alt={`${match.awayTeam.name} logo`}
                      fill
                      sizes="96px"
                      className="object-contain drop-shadow-lg"
                      priority
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }}
                    />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white text-center leading-tight">
                    {match.awayTeam.name}
                  </h2>
                </div>
              </div>

              {/* Match Info */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-gray-400">
                {match.venue && (
                  <span className="flex items-center gap-1.5">
                    🏟️ {match.venue}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  📅 {formatFullDateTime(match.date)}
                </span>
                {match.referee && (
                  <span className="flex items-center gap-1.5">
                    👨‍⚖️ {match.referee}
                  </span>
                )}
              </div>
            </div>

            {/* Watch Live Button + Admin Edit */}
            <div className="px-6 pb-6 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 w-full justify-center">
                <button
                  onClick={handleWatchLiveClick}
                  className="watch-live-btn px-10 py-3.5 rounded-xl text-white font-bold text-base flex items-center gap-2 shadow-xl transition-all hover:scale-105"
                  aria-label={hasSeenAd ? 'Continue to watch' : 'Watch live stream'}
                >
                  📺 {isAdmin ? 'Watch Live (Admin)' : hasSeenAd ? 'Continue to Watch' : 'Watch Live'}
                </button>

                {/* Admin Edit Link Button */}
                {isAdmin && customLinkLoaded && (
                  <button
                    onClick={() => { setShowEditModal(true); setEditMsg(null); }}
                    className="flex items-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-all"
                    aria-label="Edit watch live redirect link"
                  >
                    ✏️ Edit Link
                    {customLink && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Custom</span>
                    )}
                  </button>
                )}
              </div>

              {/* Show current redirect info to admin */}
              {isAdmin && customLinkLoaded && (
                <p className="text-[11px] text-center max-w-sm">
                  {customLink ? (
                    <span className="text-amber-400/80">
                      🔗 Custom URL set: <span className="underline underline-offset-2 break-all">{customLink.length > 60 ? customLink.slice(0, 60) + '…' : customLink}</span>
                    </span>
                  ) : (
                    <span className="text-gray-600">No custom link set — users redirected to Google search.</span>
                  )}
                </p>
              )}

              {!isAdmin && (
                <p className="text-[11px] text-gray-600 text-center">
                  We do not host any streams. Links redirect to external search results.
                </p>
              )}
            </div>
          </div>

          {/* Ad below header — only for users */}
          {!isAdmin && <AdBanner slot="match-top" />}

          {/* Tabs */}
          <div className="bg-secondary/50 rounded-xl border border-white/5 overflow-hidden">
            {/* Tab Bar */}
            <div className="flex overflow-x-auto border-b border-white/10 scroll-smooth">
              {TABS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`
                    flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap flex-shrink-0
                    border-b-2 transition-all duration-200
                    ${activeTab === key
                      ? 'border-highlight text-highlight bg-highlight/5'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                  aria-selected={activeTab === key}
                  role="tab"
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6 animate-fade-in" role="tabpanel">
              {activeTab === 'summary' && (
                <MatchTimeline events={events} homeTeamId={match.homeTeam.id} />
              )}
              {activeTab === 'lineups' && (
                <LineupDisplay lineups={lineups} />
              )}
              {activeTab === 'statistics' && (
                <StatisticsDisplay statistics={statistics} />
              )}
              {activeTab === 'h2h' && (
                <HeadToHead
                  h2h={h2h}
                  homeTeamId={match.homeTeam.id}
                  awayTeamId={match.awayTeam.id}
                />
              )}
              {activeTab === 'standings' && standings && (
                <StandingsTable
                  standings={standings}
                  highlightTeamIds={[match.homeTeam.id, match.awayTeam.id]}
                />
              )}
              {activeTab === 'standings' && !standings && (
                <div className="py-12 text-center text-gray-400">
                  <span className="text-4xl mb-3 block">🏆</span>
                  <p>Standings not available for this competition</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Ad — only for users */}
          {!isAdmin && (
            <div className="mt-4">
              <AdBanner slot="match-bottom" />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
          {!isAdmin && <AdBanner slot="match-sidebar" />}
        </aside>
      </div>

      {/* =================== AD POPUP MODAL (users only) =================== */}
      {!isAdmin && showAdPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#1a1f36] rounded-2xl w-full max-w-md overflow-hidden border border-white/10 shadow-2xl relative flex flex-col items-center animate-fade-in">

            {/* Close Button or Timer */}
            {adTimer > 0 ? (
              <div className="absolute top-3 right-3 px-3 py-1 bg-black/40 rounded-full text-xs text-white font-medium border border-white/10">
                Close in {adTimer}
              </div>
            ) : (
              <button
                onClick={handleClosePopup}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                aria-label="Close Advertisement"
              >
                ✕
              </button>
            )}

            <div className="p-3 w-full bg-black/20 border-b border-white/10 text-center">
              <h3 className="text-sm font-bold text-gray-400">Sponsored Advertisement</h3>
            </div>

            <div className="p-6 w-full flex flex-col items-center">
              <div className="w-full h-[250px] bg-black/40 flex items-center justify-center border border-white/5 rounded-xl overflow-hidden relative">
                <AdBanner slot="popup" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== ADMIN EDIT LINK MODAL =================== */}
      {isAdmin && showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#1a1f36] rounded-2xl w-full max-w-lg overflow-hidden border border-amber-500/20 shadow-2xl animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  ✏️ Edit Watch Live Link
                </h2>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Match ID info */}
              <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2">
                Match ID: <span className="text-gray-300 font-mono">{matchId}</span>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Redirect URL
                </label>
                <input
                  type="url"
                  value={editLinkInput}
                  onChange={(e) => setEditLinkInput(e.target.value)}
                  placeholder="https://example.com/watch-stream"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                <p className="mt-1.5 text-[11px] text-gray-600">
                  Leave empty and click &quot;Clear Link&quot; to revert to Google search fallback.
                </p>
              </div>

              {/* Feedback message */}
              {editMsg && (
                <div className={`text-sm px-4 py-2.5 rounded-lg font-medium ${
                  editMsg.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {editMsg.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveLink}
                  disabled={editSaving || !editLinkInput.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {editSaving ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      Saving…
                    </>
                  ) : '💾 Save Link'}
                </button>
                {customLink && (
                  <button
                    onClick={handleClearLink}
                    disabled={editSaving}
                    className="px-4 py-3 rounded-xl font-bold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                  >
                    🗑️ Clear
                  </button>
                )}
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={editSaving}
                  className="px-4 py-3 rounded-xl font-bold text-sm border border-white/10 text-gray-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
