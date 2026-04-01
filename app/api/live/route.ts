import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/api';

// Cache live scores for 10 minutes on server side
export const revalidate = 600;

export async function GET() {
  try {
    const matches = await getLiveMatches();
    return NextResponse.json(
      { matches, timestamp: Date.now() },
      {
        headers: {
          'Cache-Control': 's-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error) {
    console.error('Live API route error:', error);
    return NextResponse.json({ matches: [], timestamp: Date.now(), error: 'Failed to fetch live matches' }, { status: 500 });
  }
}
