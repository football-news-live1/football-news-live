import { Metadata } from 'next';
import Link from 'next/link';
import SchemaMarkup from '@/components/SchemaMarkup';
import { getBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `About Us — ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME} — your trusted source for live football scores, fixtures, results, and match statistics from Premier League, Champions League, La Liga, and 100+ football leagues worldwide.`,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `About Us — ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME}, the #1 destination for live football scores and match updates.`,
    url: `${SITE_URL}/about`,
    type: 'website',
  },
};

export default function AboutPage() {
  const breadcrumb = getBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: 'About', url: `${SITE_URL}/about` },
  ]);

  return (
    <>
      <SchemaMarkup data={breadcrumb} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><span className="text-gray-600">/</span></li>
            <li className="text-white font-medium">About</li>
          </ol>
        </nav>

        <article className="prose prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-6">
            About <span className="gradient-text">{SITE_NAME}</span>
          </h1>

          <section className="bg-card rounded-2xl border border-white/10 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-3">Who We Are</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-white">{SITE_NAME}</strong> is a free, real-time football scores platform
              delivering live match updates from over 100 football leagues and tournaments worldwide. We provide
              instant access to scores, fixtures, results, lineups, statistics, and standings — all updated
              every 10 minutes.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Whether you follow the Premier League, UEFA Champions League, La Liga, Bundesliga, Serie A,
              Ligue 1, FIFA World Cup, or any other competition, {SITE_NAME} keeps you informed with accurate,
              real-time data.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-white/10 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-3">What We Offer</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-highlight text-lg">⚽</span>
                <span><strong className="text-white">Live Scores</strong> — Real-time match scores updated every 10 minutes from leagues around the world.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-highlight text-lg">📅</span>
                <span><strong className="text-white">Fixtures & Results</strong> — Browse today&apos;s, yesterday&apos;s, and tomorrow&apos;s matches with kick-off times and final scores.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-highlight text-lg">📊</span>
                <span><strong className="text-white">Match Statistics</strong> — Detailed match stats including possession, shots, corners, fouls, and more.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-highlight text-lg">👥</span>
                <span><strong className="text-white">Lineups</strong> — Starting XI, substitutes, and formation information for every match.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-highlight text-lg">🏆</span>
                <span><strong className="text-white">Standings</strong> — League tables and group standings across all major competitions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-highlight text-lg">🤝</span>
                <span><strong className="text-white">Head-to-Head</strong> — Historical meeting records between teams.</span>
              </li>
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-white/10 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-3">Leagues We Cover</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We cover 100+ football leagues and tournaments, including:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-300">
              {[
                'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
                'UEFA Champions League', 'UEFA Europa League', 'UEFA Conference League',
                'FIFA World Cup', 'UEFA Euro', 'Copa America', 'Africa Cup of Nations',
                'Eredivisie', 'Primeira Liga', 'Super Lig', 'Belgian Pro League',
                'Brasileirão', 'Argentine Liga', 'FA Cup', 'Carabao Cup',
                'UEFA Nations League',
              ].map((league) => (
                <span key={league} className="flex items-center gap-1.5 py-1">
                  <span className="text-highlight">•</span> {league}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-white/10 p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-3">Data Source</h2>
            <p className="text-gray-300 leading-relaxed">
              All football data is sourced from <strong className="text-white">API-Football</strong>, a trusted
              provider of real-time sports data. {SITE_NAME} is an independent platform and is not affiliated with
              FIFA, UEFA, or any football organization mentioned on this site.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
