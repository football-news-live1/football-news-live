import { Metadata } from 'next';
import Link from 'next/link';
import SchemaMarkup from '@/components/SchemaMarkup';
import { getBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE_NAME}`,
  description: `Read the Terms of Service for ${SITE_NAME}. By using our live football scores platform, you agree to these terms and conditions.`,
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  const breadcrumb = getBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: 'Terms of Service', url: `${SITE_URL}/terms` },
  ]);

  return (
    <>
      <SchemaMarkup data={breadcrumb} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><span className="text-gray-600">/</span></li>
            <li className="text-white font-medium">Terms of Service</li>
          </ol>
        </nav>

        <article className="bg-card rounded-2xl border border-white/10 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using {SITE_NAME} ({SITE_URL}), you accept and agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Description of Service</h2>
              <p>
                {SITE_NAME} provides a free platform for viewing live football scores, fixtures, results,
                lineups, statistics, and standings from football leagues and tournaments worldwide. The data
                is sourced from third-party providers and is provided on an &quot;as is&quot; basis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. Accuracy of Information</h2>
              <p>
                While we strive to provide accurate and up-to-date football data, we cannot guarantee the
                accuracy, completeness, or timeliness of the information displayed. Scores and statistics
                are updated periodically and may experience delays.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Use of the Service</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Use the website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the website</li>
                <li>Scrape, copy, or redistribute the content without permission</li>
                <li>Use automated systems to access the website in a manner that sends more requests than a human could reasonably produce</li>
                <li>Interfere with the proper working of the website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. Intellectual Property</h2>
              <p>
                All content on {SITE_NAME}, including design, logos, text, and graphics, is protected by
                intellectual property laws. Team logos and league logos are the property of their respective owners
                and are used for informational purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the content,
                privacy practices, or terms of any third-party websites. Clicking on third-party links is at
                your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Limitation of Liability</h2>
              <p>
                {SITE_NAME} shall not be liable for any direct, indirect, incidental, consequential, or punitive
                damages arising from your use of or inability to use the service. This includes, but is not limited
                to, damages for loss of profits, data, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Gambling Disclaimer</h2>
              <p>
                {SITE_NAME} is an informational platform only. We do not provide gambling services, betting odds,
                or encourage gambling in any form. Any decisions made based on the information provided are solely
                your responsibility.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Continued use of the website
                after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">10. Contact</h2>
              <p>
                For questions about these Terms of Service, please visit our{' '}
                <Link href="/contact" className="text-highlight hover:underline">Contact page</Link>.
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
