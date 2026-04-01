import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMatchesByDate } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import LiveScore from '@/components/LiveScore';
import MatchListWrapper from '@/components/MatchListWrapper';

export const revalidate = 600;

// Tournament mappings
const TOURNAMENTS = {
  fifa: {
    id: 1, // FIFA World Cup
    name: 'FIFA World Cup',
    description: 'Live scores, fixtures, and results for the FIFA World Cup.',
  },
  ucl: {
    id: 2, // UEFA Champions League
    name: 'UEFA Champions League',
    description: 'Live scores, fixtures, and results for the UEFA Champions League.',
  },
  ufa: {
    id: 3, // UEFA Europa League
    name: 'UEFA Europa League',
    description: 'Live scores, fixtures, and results for the UEFA Europa League.',
  },
};

type TournamentSlug = keyof typeof TOURNAMENTS;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const tournament = TOURNAMENTS[slug as TournamentSlug];

  if (!tournament) return {};

  const title = `${tournament.name} Live Scores & Fixtures | ${SITE_NAME}`;
  const description = tournament.description;
  const canonical = `${SITE_URL}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: tournament.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function TournamentPage({ params }: Props) {
  const { slug } = params;
  const tournament = TOURNAMENTS[slug as TournamentSlug];

  if (!tournament) {
    notFound();
  }

  // Pre-fetch today's matches for ISR
  const today = formatDate(new Date());
  const initialMatches = await getMatchesByDate(today);

  // Filter ONLY matches for this tournament
  const tournamentMatches = initialMatches.filter(m => m.league.id === tournament.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white">
          <span className="gradient-text">{tournament.name}</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          {tournament.description}
        </p>
      </div>

      {/* Live Scores Section (filtered to this league) */}
      <LiveScore leagueId={tournament.id} />

      {/* Main Match List with Date Selector */}
      <MatchListWrapper 
        initialMatches={tournamentMatches} 
        initialDate={today} 
        leagueId={tournament.id}
      />
    </div>
  );
}
