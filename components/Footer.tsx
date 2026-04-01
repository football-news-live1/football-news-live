import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer-gradient border-t border-white/10 mt-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚽</span>
              <span className="text-xl font-bold font-['Poppins'] text-white">
                Football<span className="text-highlight">Live</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real-time football scores, fixtures and results from all major leagues worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/?filter=live', label: 'Live Scores' },
                { href: '/?filter=today', label: "Today's Fixtures" },
                { href: '/?filter=yesterday', label: 'Results' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Leagues */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Top Leagues</h3>
            <ul className="space-y-2">
              {[
                'Premier League',
                'La Liga',
                'Bundesliga',
                'Serie A',
                'Ligue 1',
                'Champions League',
              ].map((league) => (
                <li key={league}>
                  <span className="text-gray-400 text-sm">{league}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/disclaimer', label: 'Disclaimer' },
                { href: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {year} FootballLive. All rights reserved. Data provided by API-Football.
          </p>
          <p className="text-gray-600 text-xs text-center italic">
            FootballLive is not affiliated with any football organization. For entertainment purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
