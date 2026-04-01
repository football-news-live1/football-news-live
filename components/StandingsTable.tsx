import { StandingsGroup } from '@/lib/types';
import Image from 'next/image';

interface StandingsTableProps {
  standings: StandingsGroup;
  highlightTeamIds: number[];
}

export default function StandingsTable({ standings, highlightTeamIds }: StandingsTableProps) {
  const group = standings.league;
  const table = group.standings[0] || [];

  return (
    <div>
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <div className="relative w-5 h-5">
          <Image src={group.logo} alt={group.name} fill className="object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/images/league-placeholder.png'; }} />
        </div>
        {group.name} {group.season}/{String(group.season + 1).slice(2)}
      </h3>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm" aria-label={`${group.name} standings`}>
          <thead>
            <tr className="bg-accent/20 text-gray-400 text-xs uppercase tracking-wide">
              <th className="py-3 pl-4 pr-2 text-left w-8">#</th>
              <th className="py-3 px-2 text-left">Team</th>
              <th className="py-3 px-2 text-center">P</th>
              <th className="py-3 px-2 text-center">W</th>
              <th className="py-3 px-2 text-center">D</th>
              <th className="py-3 px-2 text-center">L</th>
              <th className="py-3 px-2 text-center">GD</th>
              <th className="py-3 px-2 text-center font-bold text-white">Pts</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, index) => {
              const isHighlighted = highlightTeamIds.includes(row.team.id);
              return (
                <tr
                  key={row.team.id}
                  className={`
                    border-t border-white/5 transition-colors
                    ${isHighlighted ? 'bg-highlight/10 ring-1 ring-highlight/30' : 'hover:bg-white/5'}
                    ${index % 2 === 1 && !isHighlighted ? 'bg-white/2' : ''}
                  `}
                >
                  <td className="py-2.5 pl-4 pr-2 text-gray-400 font-mono text-xs">{row.rank}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image src={row.team.logo} alt={row.team.name} fill className="object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/images/team-placeholder.png'; }} />
                      </div>
                      <span className={`font-medium truncate max-w-[120px] ${isHighlighted ? 'text-white' : 'text-gray-200'}`}>
                        {row.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-gray-300 font-mono text-xs">{row.all.played}</td>
                  <td className="py-2.5 px-2 text-center text-green-400 font-mono text-xs">{row.all.win}</td>
                  <td className="py-2.5 px-2 text-center text-gray-400 font-mono text-xs">{row.all.draw}</td>
                  <td className="py-2.5 px-2 text-center text-red-400 font-mono text-xs">{row.all.lose}</td>
                  <td className={`py-2.5 px-2 text-center font-mono text-xs ${row.goalsDiff > 0 ? 'text-green-400' : row.goalsDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {row.goalsDiff > 0 ? '+' : ''}{row.goalsDiff}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-white font-mono">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
