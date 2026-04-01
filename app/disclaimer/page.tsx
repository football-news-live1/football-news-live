import { Metadata } from 'next';
import Link from 'next/link';
import SchemaMarkup from '@/components/SchemaMarkup';
import { getBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Disclaimer — ${SITE_NAME}`,
  description: `Read the Disclaimer for ${SITE_NAME}. Important information about our data sources, affiliations, and the nature of our live football scores service.`,
  alternates: { canonical: `${SITE_URL}/disclaimer` },
};

export default function DisclaimerPage() {
  const breadcrumb = getBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: 'Disclaimer', url: `${SITE_URL}/disclaimer` },
  ]);

  return (
    <>
      <SchemaMarkup data={breadcrumb} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><span className="text-gray-600">/</span></li>
            <li className="text-white font-medium">Disclaimer</li>
          </ol>
        </nav>

        <article className="bg-card rounded-2xl border border-white/10 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-6">
            Disclaimer
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-2">No Affiliation</h2>
              <p>
                {SITE_NAME} is an <strong className="text-white">independent platform</strong> and is
                not affiliated with, endorsed by, or connected to FIFA, UEFA, the Premier League, La Liga,
                Bundesliga, Serie A, Ligue 1, or any other football organization, team, or governing body
                mentioned on this website.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Data Accuracy</h2>
              <p>
                All football scores, fixtures, results, statistics, and other data displayed on {SITE_NAME} are
                sourced from third-party data providers (API-Football). While we make every effort to ensure
                accuracy, we do not guarantee that the data is error-free, complete, or current. Data may be
                subject to delays.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">For Entertainment Purposes Only</h2>
              <p>
                The content provided on {SITE_NAME} is intended for <strong className="text-white">entertainment
                and informational purposes only</strong>. It should not be used as the sole basis for any financial
                decisions, betting, or gambling activities. We do not promote or facilitate gambling in any form.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Trademarks</h2>
              <p>
                All team names, logos, league names, and related trademarks displayed on this website are the
                property of their respective owners. Their use on {SITE_NAME} is purely for identification and
                informational purposes under fair use principles.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">External Links</h2>
              <p>
                {SITE_NAME} may contain links to external websites. We are not responsible for the content or
                practices of any linked websites. Users follow external links at their own risk.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">No Streaming</h2>
              <p>
                {SITE_NAME} does <strong className="text-white">not host, provide, or stream</strong> any
                live football matches. Any &quot;Watch Live&quot; functionality redirects users to external search
                results or third-party websites. We are not responsible for the content found on those external sites.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
              <p>
                If you have concerns about any content on this website, please reach out through our{' '}
                <Link href="/contact" className="text-highlight hover:underline">Contact page</Link>.
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
