import { NextResponse } from 'next/server';
import { getMatchesByDate } from '@/lib/api';

export const revalidate = 600;

interface Props {
  params: { date: string };
}

export async function GET(_req: Request, { params }: Props) {
  const { date } = params;

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
  }

  try {
    const matches = await getMatchesByDate(date);
    return NextResponse.json(
      { matches, date, timestamp: Date.now() },
      {
        headers: {
          'Cache-Control': 's-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error) {
    console.error('Matches API route error:', error);
    return NextResponse.json({ matches: [], error: 'Failed to fetch matches' }, { status: 500 });
  }
}
