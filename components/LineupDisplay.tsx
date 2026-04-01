import { Lineup } from '@/lib/types';
import Image from 'next/image';

interface LineupDisplayProps {
  lineups: Lineup[];
}

const POS_COLORS: Record<string, string> = {
  G: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  D: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  M: 'bg-green-500/20 border-green-500/50 text-green-300',
  F: 'bg-red-500/20 border-red-500/50 text-red-300',
};

export default function LineupDisplay({ lineups }: LineupDisplayProps) {
  if (lineups.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <span className="text-4xl mb-3 block">👥</span>
        <p>Lineups not available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {lineups.map((lineup) => (
        <div key={lineup.team.id} className="bg-secondary/50 rounded-xl border border-white/5 overflow-hidden">
          {/* Team Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-accent/20 border-b border-white/5">
            <div className="relative w-8 h-8">
              <Image
                src={lineup.team.logo}
                alt={lineup.team.name}
                fill
                className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.png'; }}
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{lineup.team.name}</h3>
              <p className="text-xs text-gray-400">Formation: {lineup.formation}</p>
            </div>
          </div>

          {/* Coach */}
          <div className="px-4 py-2 bg-white/3 border-b border-white/5">
            <p className="text-xs text-gray-400">
              🎽 Manager: <span className="text-white font-medium">{lineup.coach.name}</span>
            </p>
          </div>

          {/* Starting XI */}
          <div className="p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Starting XI</h4>
            <div className="space-y-1.5">
              {lineup.startXI.map(({ player }) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className={`
                    w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold border flex-shrink-0
                    ${POS_COLORS[player.pos] || 'bg-white/10 border-white/20 text-gray-300'}
                  `}>
                    {player.number}
                  </span>
                  <span className="text-sm text-white font-medium truncate">{player.name}</span>
                  <span className="ml-auto text-[10px] text-gray-500 font-medium">{player.pos}</span>
                </div>
              ))}
            </div>

            {/* Substitutes */}
            {lineup.substitutes.length > 0 && (
              <>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-5">Substitutes</h4>
                <div className="space-y-1.5">
                  {lineup.substitutes.map(({ player }) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/3 hover:bg-white/8 transition-colors"
                    >
                      <span className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold border border-white/10 text-gray-400 flex-shrink-0">
                        {player.number}
                      </span>
                      <span className="text-sm text-gray-300 truncate">{player.name}</span>
                      <span className="ml-auto text-[10px] text-gray-600">{player.pos}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
