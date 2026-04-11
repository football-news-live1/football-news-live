import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import SchemaMarkup from '@/components/SchemaMarkup';
import { getOrganizationJsonLd } from '@/lib/seo';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Live Football Scores, Fixtures & Results Today | Football News Live',
    template: '%s | Football News Live',
  },
  description:
    'Football News Live — your #1 source for real-time football scores, today\'s fixtures, live match updates, and results. Covering Premier League, Champions League, La Liga, Serie A, Bundesliga, Ligue 1, FIFA World Cup, and 100+ leagues worldwide. Updated every 10 minutes.',
  keywords: [
    'live football scores',
    'football news live',
    'footballnewslive',
    'football results today',
    'football fixtures',
    'football live scores today',
    'live score football',
    'today football match score',
    'football match live',
    'premier league scores',
    'champions league live',
    'la liga live scores',
    'bundesliga results',
    'serie a scores',
    'ligue 1 results',
    'fifa world cup live',
    'europa league scores',
    'football standings',
    'football match results today',
    'live football updates',
    'football scores today',
    'football results live',
    'match scores today',
  ],
  applicationName: 'Football News Live',
  authors: [{ name: 'Football News Live', url: 'https://footballnewslive.online' }],
  creator: 'Football News Live',
  publisher: 'Football News Live',
  category: 'Sports',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://footballnewslive.online'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Football News Live',
    locale: 'en_US',
    title: 'Live Football Scores, Fixtures & Results Today | Football News Live',
    description:
      'Real-time football scores, fixtures, live match updates from Premier League, Champions League, La Liga, and 100+ leagues worldwide.',
    url: 'https://footballnewslive.online',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Football News Live — Live Football Scores',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@FootballNewsLive',
    creator: '@FootballNewsLive',
    title: 'Live Football Scores, Fixtures & Results | Football News Live',
    description:
      'Real-time football scores from Premier League, Champions League, La Liga and 100+ leagues.',
    images: ['/og-image.png'],
  },
  verification: {
    // Replace with actual verification codes after registering
    // google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    // other: { 'msvalidate.01': 'YOUR_BING_VERIFICATION_CODE' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'revisit-after': '1 day',
    'rating': 'general',
    'distribution': 'global',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = getOrganizationJsonLd();

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Preconnect to image CDNs for faster loading */}
        <link rel="preconnect" href="https://media.api-sports.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link rel="preconnect" href="https://crests.football-data.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://crests.football-data.org" />

        {/* Organization Schema for brand recognition */}
        <SchemaMarkup data={organizationSchema} />

        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1251224740771243"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Monetag MultiTag (Optimized for Revenue: Popunder, Vignette, Push) */}
        <Script
          id="monetag-multitag"
          src="https://quge5.com/88/tag.min.js"
          data-zone="225513"
          strategy="afterInteractive"
          data-cfasync="false"
        />

        {/* Monetag Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              try {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  // Gracefully handle SW registration failure
                });
              } catch (e) {
                // Ignore registration errors
              }
            }
          `}
        </Script>
      </head>
      <body className="bg-primary min-h-screen flex flex-col">
        <Header />

        {/* Header Banner Ad */}
        <div className="w-full bg-secondary border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <AdBanner slot="header" />
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>

        <Footer />

        {/* Social bar / interstitial ad (loads after 5s) */}
        <AdBanner slot="social-bar" />
      </body>
    </html>
  );
}
