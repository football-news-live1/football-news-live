import { Fixture } from '@/lib/types';
import Image from 'next/image';
import { formatDisplayDate } from '@/lib/utils';

interface HeadToHeadProps {
  h2h: Fixture[];
  homeTeamId: number;
  awayTeamId: number;
}

export default function HeadToHead({ h2h, homeTeamId, awayTeamId }: HeadToHeadProps) {
  if (h2h.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <span className="text-4xl mb-3 block">🤝</span>
        <p>No head-to-head data available</p>
      </div>
    );
  }

  // Calculate W/D/L from home team perspective
  let homeWins = 0, draws = 0, awayWins = 0;
  for (const fixture of h2h) {
    const hg = fixture.goals.home ?? 0;
    const ag = fixture.goals.away ?? 0;
    const isHomeTeamPlayingHome = fixture.teams.home.id === homeTeamId;

    if (hg === ag) {
      draws++;
    } else if ((hg > ag && isHomeTeamPlayingHome) || (ag > hg && !isHomeTeamPlayingHome)) {
      homeWins++;
    } else {
      awayWins++;
    }
  }

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { count: homeWins, label: 'Wins', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { count: draws, label: 'Draws', color: 'text-gray-400', bg: 'bg-white/5 border-white/10' },
          { count: awayWins, label: 'Losses', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map((item) => (
          <div
            key={item.label}
            className={`text-center py-4 rounded-xl border ${item.bg}`}
          >
            <p className={`text-3xl font-bold font-mono ${item.color}`}>{item.count}</p>
            <p className="text-xs text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Win/draw/lose bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 mb-6 gap-0.5">
        <div className="bg-green-500 rounded-l-full" style={{ width: `${(homeWins / h2h.length) * 100}%` }} />
        <div className="bg-gray-500" style={{ width: `${(draws / h2h.length) * 100}%` }} />
        <div className="bg-red-500 rounded-r-full" style={{ width: `${(awayWins / h2h.length) * 100}%` }} />
      </div>

      {/* Past meetings */}
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Last {h2h.length} meetings</h4>
      <div className="space-y-2">
        {h2h.map((fixture) => {
          const hg = fixture.goals.home ?? 0;
          const ag = fixture.goals.away ?? 0;
          const homeWon = hg > ag;
          const awayWon = ag > hg;

          return (
            <div
              key={fixture.fixture.id}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
            >
              <span className="text-[11px] text-gray-500 w-20 flex-shrink-0">{formatDisplayDate(new Date(fixture.fixture.date))}</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} fill className="object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }} />
                </div>
                <span className={`text-xs font-medium truncate ${homeWon ? 'text-white' : 'text-gray-400'}`}>{fixture.teams.home.name}</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-sm flex-shrink-0">
                <span className={homeWon ? 'text-green-400' : awayWon ? 'text-red-400' : 'text-gray-300'}>{hg}</span>
                <span className="text-gray-600">-</span>
                <span className={awayWon ? 'text-green-400' : homeWon ? 'text-red-400' : 'text-gray-300'}>{ag}</span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className={`text-xs font-medium truncate ${awayWon ? 'text-white' : 'text-gray-400'}`}>{fixture.teams.away.name}</span>
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} fill className="object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.webp'; }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
