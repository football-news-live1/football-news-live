import { NextRequest, NextResponse } from 'next/server';
import { readLinks } from '@/lib/link-db';

// Public endpoint — no auth needed
export async function GET(
  _request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const links = await readLinks();
  const url = links[params.matchId] || null;
  return NextResponse.json({ url }, {
    headers: {
      // Cache for 30s, then revalidate — so link changes propagate quickly
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
