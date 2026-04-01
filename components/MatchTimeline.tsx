import { MatchEvent } from '@/lib/types';
import { EVENT_ICONS } from '@/lib/constants';

interface MatchTimelineProps {
  events: MatchEvent[];
  homeTeamId: number;
}

export default function MatchTimeline({ events, homeTeamId }: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <span className="text-4xl mb-3 block">📋</span>
        <p>No events yet</p>
      </div>
    );
  }

  return (
    <div className="relative" role="list" aria-label="Match timeline">
      {/* Center timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 transform -translate-x-1/2" />

      <div className="space-y-3">
        {events.map((event, index) => {
          const isHome = event.team.id === homeTeamId;
          const icon = EVENT_ICONS[event.type] || EVENT_ICONS[event.detail] || '📌';
          const isGoal = event.type === 'Goal' || event.detail === 'Penalty' || event.detail === 'Own Goal';
          const isCard = event.type === 'Card';
          const isSubst = event.type === 'subst' || event.type === 'Subst';

          return (
            <div
              key={index}
              className={`flex items-center gap-3 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
              role="listitem"
            >
              {/* Team side content */}
              <div className={`flex-1 flex ${isHome ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-xs px-3 py-2 rounded-lg text-sm
                  ${isGoal ? 'bg-green-500/15 border border-green-500/30' : ''}
                  ${isCard ? 'bg-yellow-500/10 border border-yellow-500/20' : ''}
                  ${isSubst ? 'bg-blue-500/10 border border-blue-500/20' : ''}
                  ${!isGoal && !isCard && !isSubst ? 'bg-white/5' : ''}
                  ${isHome ? 'text-right' : 'text-left'}
                `}>
                  <p className="font-semibold text-white text-sm">{event.player.name}</p>
                  {event.assist?.name && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isSubst ? `← ${event.assist.name}` : `Assist: ${event.assist.name}`}
                    </p>
                  )}
                  {event.detail && event.detail !== event.type && (
                    <p className="text-xs text-gray-500">{event.detail}</p>
                  )}
                </div>
              </div>

              {/* Center - minute + icon */}
              <div className="flex flex-col items-center z-10">
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-base
                  border-2 bg-secondary
                  ${isGoal ? 'border-green-500' : isCard ? 'border-yellow-500' : isSubst ? 'border-blue-500' : 'border-white/20'}
                `}>
                  {icon}
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5 font-mono">{event.time.elapsed}&apos;</span>
              </div>

              {/* Other side - empty spacer */}
              <div className="flex-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
