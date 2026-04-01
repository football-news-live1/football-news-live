export default function StandingsWidget() {
  return (
    <div className="bg-card rounded-xl border border-white/5 overflow-hidden">
      <div className="bg-accent/30 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">🏆 Top Leagues</h3>
      </div>
      <div className="p-3 space-y-1">
        {[
          { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Premier League', country: 'England' },
          { flag: '🇪🇸', name: 'La Liga', country: 'Spain' },
          { flag: '🇩🇪', name: 'Bundesliga', country: 'Germany' },
          { flag: '🇮🇹', name: 'Serie A', country: 'Italy' },
          { flag: '🇫🇷', name: 'Ligue 1', country: 'France' },
          { flag: '🌍', name: 'Champions League', country: 'Europe' },
        ].map((league) => (
          <div
            key={league.name}
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          >
            <span className="text-lg">{league.flag}</span>
            <div>
              <p className="text-sm font-medium text-white">{league.name}</p>
              <p className="text-[11px] text-gray-500">{league.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
