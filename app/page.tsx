import { Metadata } from 'next';
import { getHomepageMeta, getWebsiteJsonLd } from '@/lib/seo';
import { getMatchesByDate } from '@/lib/api';
import { formatDate, getDateForFilter } from '@/lib/utils';
import SchemaMarkup from '@/components/SchemaMarkup';
import LiveScore from '@/components/LiveScore';
import MatchListWrapper from '@/components/MatchListWrapper';

export const revalidate = 60;

const meta = getHomepageMeta();

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: meta.canonical },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.canonical,
    type: 'website',
    images: [{ url: meta.ogImage, width: 1200, height: 630, alt: 'Football News Live' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    images: [meta.ogImage],
  },
};

export default async function HomePage() {
  // Pre-fetch today's matches for ISR
  const today = formatDate(new Date());
  const initialMatches = await getMatchesByDate(today);

  const websiteSchema = getWebsiteJsonLd();

  return (
    <>
      <SchemaMarkup data={websiteSchema} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white">
            ⚽ <span className="gradient-text">Live Football</span> Scores
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Real-time scores, fixtures and results from all major leagues worldwide
          </p>
        </div>

        {/* Live Scores Section (client-side with polling) */}
        <LiveScore />

        {/* Main Match List with Date Selector */}
        <MatchListWrapper initialMatches={initialMatches} initialDate={today} />
      </div>
    </>
  );
}
