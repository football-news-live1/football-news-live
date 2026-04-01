import fs from 'fs';
import path from 'path';

// Define the file paths for local and serverless environments
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'watch-links.json');
const TMP_DATA_FILE = '/tmp/watch-links.json'; // Vercel writable folder

// In-memory cache for ultra-fast reads during warm executions (works perfectly on Vercel)
if (!(globalThis as any)._linksCache) {
  (globalThis as any)._linksCache = null;
}

import { kv } from '@vercel/kv';

/**
 * Robust async read algorithm pulling from Vercel KV (shared edge database)
 */
export async function readLinks(): Promise<Record<string, string>> {
  try {
    const data = await kv.get<Record<string, string>>('watch-links');
    return data || {};
  } catch (err) {
    console.error('Vercel KV read error:', err);
    return {};
  }
}

/**
 * Robust async write algorithm pushing updates globally to Vercel KV database
 */
export async function writeLinks(links: Record<string, string>): Promise<void> {
  try {
    await kv.set('watch-links', links);
  } catch (err) {
    console.error('Vercel KV write error:', err);
  }
}

