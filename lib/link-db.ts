import fs from 'fs';
import path from 'path';

// Define the file paths for local and serverless environments
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'watch-links.json');
const TMP_DATA_FILE = '/tmp/watch-links.json'; // Vercel writable folder

// In-memory cache for ultra-fast reads during warm executions (works perfectly on Vercel)
if (!(globalThis as any)._linksCache) {
  (globalThis as any)._linksCache = null;
}

/**
 * Robust read algorithm prioritizing memory, then /tmp, then local
 */
export function readLinks(): Record<string, string> {
  const cache = (globalThis as any)._linksCache;
  if (cache) return { ...cache };

  let content = null;
  try {
    if (fs.existsSync(TMP_DATA_FILE)) {
      content = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
    } else if (fs.existsSync(LOCAL_DATA_FILE)) {
      content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
    }
    
    if (content) {
      const parsed = JSON.parse(content);
      (globalThis as any)._linksCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading links DB', err);
  }

  return {};
}

/**
 * Robust write algorithm prioritizing /tmp, then local, then memory
 */
export function writeLinks(links: Record<string, string>): void {
  // Always update in-memory cache instantly
  (globalThis as any)._linksCache = { ...links };

  const dataStr = JSON.stringify(links, null, 2);

  // Attempt to write to /tmp/ (Works in Vercel Serverless)
  try {
    fs.writeFileSync(TMP_DATA_FILE, dataStr, 'utf-8');
  } catch (err) {
    console.warn('Could not write to /tmp:', err);
  }

  // Attempt to write to Local JSON if running locally in dev mode
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // This will throw EROFS on Vercel, which gets caught silently
    fs.writeFileSync(LOCAL_DATA_FILE, dataStr, 'utf-8');
  } catch (err) {
    // Expected on Vercel production
  }
}
