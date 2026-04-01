'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProcessedMatch } from '@/lib/types';
import { getMatchStatusDisplay, isLive, isFinished, formatKickoffTime } from '@/lib/utils';

interface MatchCardProps {
  match: ProcessedMatch;
  compact?: boolean;
}

export default function MatchCard({ match, compact = false }: MatchCardProps) {
  const live = isLive(match.statusShort);
  const finished = isFinished(match.statusShort);
  const statusDisplay = getMatchStatusDisplay(match);
  const kickoff = formatKickoffTime(match.date);

  const cardClasses = `match-card block bg-card border border-white/5 rounded-xl overflow-hidden cursor-pointer
    ${live ? 'ring-1 ring-highlight/40 bg-gradient-to-r from-highlight/5 to-transparent' : ''}
    ${compact ? 'px-3 py-2.5' : 'px-4 py-3.5'}
  `;

  return (
    <Link href={`/match/${match.slug}`} className={cardClasses} aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}>
      <div className="flex items-center gap-2">
        {/* Home Team */}
        <div className={`flex items-center gap-2 flex-1 min-w-0 ${compact ? '' : 'justify-end flex-row-reverse'} md:flex-row md:justify-start`}>
          <div className="relative flex-shrink-0 w-8 h-8">
            <Image
              src={match.homeTeam.logo}
              alt={`${match.homeTeam.name} logo`}
              fill
              sizes="32px"
              loading="lazy"
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }}
            />
          </div>
          <span className={`font-semibold text-white truncate ${compact ? 'text-xs' : 'text-sm'} md:text-right`}>
            {match.homeTeam.name}
          </span>
        </div>

        {/* Score / Time */}
        <div className="flex-shrink-0 flex flex-col items-center min-w-[80px]">
          {/* Status badge */}
          {live ? (
            <div className="flex items-center gap-1 mb-1">
              <span className="live-dot"></span>
              <span className="text-highlight text-[10px] font-bold uppercase">LIVE</span>
            </div>
          ) : null}

          {/* Score or time */}
          {(live || finished) ? (
            <div className="flex items-center gap-1">
              <span className={`font-mono font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>
                {match.homeScore ?? '-'}
              </span>
              <span className={`font-mono text-gray-500 ${compact ? 'text-base' : 'text-xl'}`}>-</span>
              <span className={`font-mono font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>
                {match.awayScore ?? '-'}
              </span>
            </div>
          ) : (
            <span className={`font-mono font-semibold text-gray-300 ${compact ? 'text-sm' : 'text-base'}`}>
              {kickoff}
            </span>
          )}

          {/* Status line */}
          <div className={`mt-0.5 ${live ? 'text-highlight' : finished ? 'text-gray-400' : 'text-gray-500'} text-[11px] font-medium`}>
            {statusDisplay}
          </div>
        </div>

        {/* Away Team */}
        <div className={`flex items-center gap-2 flex-1 min-w-0 ${compact ? 'flex-row-reverse' : ''} md:flex-row-reverse md:justify-start`}>
          <div className="relative flex-shrink-0 w-8 h-8">
            <Image
              src={match.awayTeam.logo}
              alt={`${match.awayTeam.name} logo`}
              fill
              sizes="32px"
              loading="lazy"
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }}
            />
          </div>
          <span className={`font-semibold text-white truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Live pulsing border */}
      {live && (
        <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-highlight/60 to-transparent rounded-full" />
      )}
    </Link>
  );
}
