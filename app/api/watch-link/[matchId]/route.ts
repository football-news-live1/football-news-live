import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'watch-links.json');

function readLinks(): Record<string, string> {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// Public endpoint — no auth needed
export async function GET(
  _request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const links = readLinks();
  const url = links[params.matchId] || null;
  return NextResponse.json({ url }, {
    headers: {
      // Cache for 30s, then revalidate — so link changes propagate quickly
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
