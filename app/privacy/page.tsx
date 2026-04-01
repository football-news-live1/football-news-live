import { Metadata } from 'next';
import Link from 'next/link';
import SchemaMarkup from '@/components/SchemaMarkup';
import { getBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
  description: `Read the Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your personal information when you use our live football scores platform.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  const breadcrumb = getBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: 'Privacy Policy', url: `${SITE_URL}/privacy` },
  ]);

  return (
    <>
      <SchemaMarkup data={breadcrumb} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><span className="text-gray-600">/</span></li>
            <li className="text-white font-medium">Privacy Policy</li>
          </ol>
        </nav>

        <article className="bg-card rounded-2xl border border-white/10 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Introduction</h2>
              <p>
                Welcome to {SITE_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). This Privacy Policy explains how we collect, use,
                and protect information when you visit our website at{' '}
                <Link href="/" className="text-highlight hover:underline">{SITE_URL}</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Information We Collect</h2>
              <p className="mb-3">We may collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-white">Usage Data:</strong> Pages visited, time spent, browser type, device information, and referring URL.</li>
                <li><strong className="text-white">Cookies:</strong> We use cookies to enhance your browsing experience and for analytics purposes.</li>
                <li><strong className="text-white">Log Data:</strong> Server logs including IP addresses, access times, and pages viewed.</li>
              </ul>
              <p className="mt-3">We do <strong className="text-white">not</strong> collect personal information such as names, email addresses, or payment details unless you voluntarily provide them through our contact page.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. How We Use Information</h2>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>To provide and maintain our live football scores service</li>
                <li>To analyze website traffic and improve user experience</li>
                <li>To display relevant advertisements</li>
                <li>To detect and prevent technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Third-Party Services</h2>
              <p>
                We use third-party services including analytics providers and advertising networks (such as Monetag).
                These services may collect information about your browsing activity across websites. Please refer to
                their respective privacy policies for more information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. Advertising</h2>
              <p>
                We display advertisements to support our free service. Our advertising partners may use cookies and
                similar technologies to serve ads based on your interests. You can adjust your browser settings to
                manage or block cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Data Security</h2>
              <p>
                We implement appropriate security measures to protect against unauthorized access, alteration, or
                destruction of data. However, no method of internet transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Children&apos;s Privacy</h2>
              <p>
                Our service is not directed to individuals under the age of 13. We do not knowingly collect
                personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please visit our{' '}
                <Link href="/contact" className="text-highlight hover:underline">Contact page</Link>.
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
