import { MatchStatistics } from '@/lib/types';

interface StatisticsDisplayProps {
  statistics: MatchStatistics[];
}

function parseStatValue(val: string | number | null): number {
  if (val === null) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.replace('%', '')) || 0;
}

export default function StatisticsDisplay({ statistics }: StatisticsDisplayProps) {
  if (statistics.length < 2) {
    return (
      <div className="py-12 text-center text-gray-400">
        <span className="text-4xl mb-3 block">📊</span>
        <p>Statistics not available</p>
      </div>
    );
  }

  const homeStats = statistics[0];
  const awayStats = statistics[1];

  // Build stat pairs
  const statPairs = homeStats.statistics.map((homeStat, i) => {
    const awayStat = awayStats.statistics[i];
    if (!awayStat) return null;
    return {
      type: homeStat.type,
      home: homeStat.value,
      away: awayStat.value,
    };
  }).filter(Boolean);

  return (
    <div className="space-y-1">
      {/* Team Headers */}
      <div className="flex items-center justify-between px-4 py-2 mb-4">
        <span className="text-sm font-bold text-white">{homeStats.team.name}</span>
        <span className="text-xs text-gray-400">Stats</span>
        <span className="text-sm font-bold text-white">{awayStats.team.name}</span>
      </div>

      {statPairs.map((stat) => {
        if (!stat) return null;
        const homeVal = parseStatValue(stat.home);
        const awayVal = parseStatValue(stat.away);
        const total = homeVal + awayVal || 1;
        const homePercent = Math.round((homeVal / total) * 100);
        const awayPercent = 100 - homePercent;

        const isPercent = typeof stat.home === 'string' && String(stat.home).includes('%');
        const homeDisplay = isPercent ? stat.home : homeVal || 0;
        const awayDisplay = isPercent ? stat.away : awayVal || 0;

        return (
          <div key={stat.type} className="px-4 py-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-sm min-w-[3rem]">{homeDisplay}</span>
              <span className="text-xs text-gray-400 text-center flex-1">{stat.type}</span>
              <span className="font-bold text-white text-sm min-w-[3rem] text-right">{awayDisplay}</span>
            </div>
            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
              <div
                className="stat-bar bg-blue-500 rounded-l-full"
                style={{ width: `${homePercent}%` }}
              />
              <div
                className="stat-bar bg-red-500 rounded-r-full"
                style={{ width: `${awayPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
