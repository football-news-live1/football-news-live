import { Metadata } from 'next';
import Link from 'next/link';
import SchemaMarkup from '@/components/SchemaMarkup';
import { getBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Contact Us — ${SITE_NAME}`,
  description: `Get in touch with ${SITE_NAME}. Have questions, feedback, or need to report an issue? Reach out to us and we'll get back to you.`,
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  const breadcrumb = getBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: 'Contact', url: `${SITE_URL}/contact` },
  ]);

  return (
    <>
      <SchemaMarkup data={breadcrumb} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><span className="text-gray-600">/</span></li>
            <li className="text-white font-medium">Contact</li>
          </ol>
        </nav>

        <article className="bg-card rounded-2xl border border-white/10 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-6">
            Contact <span className="gradient-text">Us</span>
          </h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <p className="text-lg">
                Have questions, feedback, or need to report an issue? We&apos;d love to hear from you!
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  📧 General Inquiries
                </h2>
                <p className="text-sm text-gray-400">
                  For general questions about {SITE_NAME}, partnerships, or advertising opportunities.
                </p>
                <p className="mt-3 text-highlight font-medium text-sm">
                  contact@footballnewslive.online
                </p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  🐛 Bug Reports
                </h2>
                <p className="text-sm text-gray-400">
                  Found a bug, incorrect score, or broken feature? Let us know so we can fix it.
                </p>
                <p className="mt-3 text-highlight font-medium text-sm">
                  bugs@footballnewslive.online
                </p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  ⚖️ Content Removal
                </h2>
                <p className="text-sm text-gray-400">
                  If you believe any content on our site infringes your rights, please contact us with details.
                </p>
                <p className="mt-3 text-highlight font-medium text-sm">
                  legal@footballnewslive.online
                </p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  📢 Advertising
                </h2>
                <p className="text-sm text-gray-400">
                  Interested in advertising on {SITE_NAME}? We offer various ad placement options.
                </p>
                <p className="mt-3 text-highlight font-medium text-sm">
                  ads@footballnewslive.online
                </p>
              </div>
            </section>

            <section className="bg-accent/20 rounded-xl border border-accent/30 p-5 mt-4">
              <h2 className="text-base font-bold text-white mb-2">⏱️ Response Time</h2>
              <p className="text-sm text-gray-300">
                We aim to respond to all inquiries within <strong className="text-white">48 hours</strong>.
                Please include as much detail as possible in your message to help us assist you more effectively.
              </p>
            </section>

            <section className="text-center pt-4 border-t border-white/10">
              <p className="text-sm text-gray-500">
                {SITE_NAME} • <Link href="/" className="text-highlight hover:underline">Back to Home</Link> •{' '}
                <Link href="/about" className="text-highlight hover:underline">About Us</Link>
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
