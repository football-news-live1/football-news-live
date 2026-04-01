import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOKEN, COOKIE_NAME } from '@/lib/admin-config';
import { readLinks, writeLinks } from '@/lib/link-db';

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === ADMIN_TOKEN;
}

// GET — return all custom links
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const links = readLinks();
  return NextResponse.json({ links });
}

// POST — set/update a link for a match
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { matchId, url } = body;

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
    }
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const links = readLinks();
    links[matchId] = url;
    writeLinks(links);

    return NextResponse.json({ success: true, matchId, url });
  } catch (err: any) {
    console.error('Error in POST /api/admin/links:', err);
    return NextResponse.json({ error: 'Bad request: ' + (err?.message || 'Unknown error') }, { status: 400 });
  }
}

// DELETE — remove a link for a match
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { matchId } = body;

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
    }

    const links = readLinks();
    delete links[matchId];
    writeLinks(links);

    return NextResponse.json({ success: true, matchId });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
