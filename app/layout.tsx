import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';

export const metadata: Metadata = {
  title: {
    default: 'Live Football Scores, Fixtures & Results | FootballLive',
    template: '%s | FootballLive',
  },
  description:
    'Get real-time football scores, today\'s fixtures, yesterday\'s results and tomorrow\'s upcoming matches. Live updates from Premier League, Champions League, La Liga and more.',
  keywords: [
    'live football scores',
    'football results today',
    'football fixtures',
    'premier league scores',
    'champions league live',
  ],
  authors: [{ name: 'FootballLive' }],
  creator: 'FootballLive',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'FootballLive',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@FootballLive',
  },
  verification: {},
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
