import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ADMIN_TOKEN, COOKIE_NAME } from '@/lib/admin-config';
const DATA_FILE = path.join(process.cwd(), 'data', 'watch-links.json');

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === ADMIN_TOKEN;
}

function readLinks(): Record<string, string> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '{}', 'utf-8');
      return {};
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function writeLinks(links: Record<string, string>): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
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
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
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
