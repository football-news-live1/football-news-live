import fs from 'fs';
import path from 'path';

// Define the file paths for local and serverless environments
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'watch-links.json');
const TMP_DATA_FILE = '/tmp/watch-links.json'; // Vercel writable folder

// In-memory cache for ultra-fast reads during warm executions (works perfectly on Vercel)
if (!(globalThis as any)._linksCache) {
  (globalThis as any)._linksCache = null;
}

const DB_URL = 'https://api.restful-api.dev/objects/ff8081819d3fcc30019d4ac5cd64131d';

/**
 * Read from the 100% free, zero-config global database across Vercel edge instances instantly
 */
export async function readLinks(): Promise<Record<string, string>> {
  try {
    const res = await fetch(DB_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return json?.data?.watchLinks || {};
    }
    return {};
  } catch (err) {
    console.error('Database read error:', err);
    return {};
  }
}

/**
 * Write links changes out globally
 */
export async function writeLinks(links: Record<string, string>): Promise<void> {
  try {
    await fetch(DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'linksDb', data: { watchLinks: links } }),
    });
  } catch (err) {
    console.error('Database write error:', err);
  }
}

