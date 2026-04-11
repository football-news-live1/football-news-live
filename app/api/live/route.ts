import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/api';
import { getCurrentUtcSlot } from '@/lib/constants';

// Cache live scores for 10 minutes on server side
export const revalidate = 30;

export async function GET() {
  try {
    const matches = await getLiveMatches();
    const utcSlot = getCurrentUtcSlot();
    return NextResponse.json(
      { matches, timestamp: Date.now(), utcSlot },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Live API route error:', error);
    return NextResponse.json({ matches: [], timestamp: Date.now(), error: 'Failed to fetch live matches' }, { status: 500 });
  }
}
