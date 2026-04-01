/**
 * API Key Manager — Intelligent multi-key rotation for API-Football
 *
 * Features:
 *  - Round-robin rotation across N keys
 *  - Per-key daily usage tracking (resets at midnight UTC)
 *  - Auto-skip exhausted keys (>= MAX_REQUESTS_PER_KEY_PER_DAY)
 *  - Rate-limit cooldown (60s) on 429 errors
 *  - Retry-friendly: getNextKey() always returns the best available key
 *  - Singleton: shared across all server-side code in the same process
 */

import {
  MAX_REQUESTS_PER_KEY_PER_DAY,
  KEY_COOLDOWN_MS,
} from './constants';

interface KeyUsage {
  /** Number of API requests made today with this key */
  count: number;
  /** Timestamp (ms) when daily counter resets — midnight UTC of the next day */
  resetAt: number;
  /** If rate-limited, don't use until this timestamp (ms) */
  cooldownUntil: number;
}

function getMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return tomorrow.getTime();
}

class ApiKeyManager {
  private keys: string[];
  private currentIndex: number;
  private usage: Map<string, KeyUsage>;

  constructor() {
    // Parse keys from environment — comma-separated list
    const raw = process.env.API_FOOTBALL_KEYS || '';
    // Also support the legacy single-key env vars as fallback
    const legacyKey1 = process.env.API_FOOTBALL_KEY || '';
    const legacyKey2 = process.env.API_FOOTBALL_KEY_2 || '';

    let parsedKeys: string[] = [];

    if (raw.trim()) {
      parsedKeys = raw
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
    }

    // Merge legacy keys if they aren't already in the list
    for (const legacy of [legacyKey1, legacyKey2]) {
      if (legacy && !parsedKeys.includes(legacy)) {
        parsedKeys.push(legacy);
      }
    }

    if (parsedKeys.length === 0) {
      console.error('[KeyManager] ⚠️  No API keys found! Set API_FOOTBALL_KEYS in .env.local');
    }

    this.keys = parsedKeys;
    this.currentIndex = 0;
    this.usage = new Map();

    // Initialize usage tracking for every key
    const resetAt = getMidnightUTC();
    for (const key of this.keys) {
      this.usage.set(key, { count: 0, resetAt, cooldownUntil: 0 });
    }

    console.log(`[KeyManager] ✅ Loaded ${this.keys.length} API key(s)`);
  }

  /** Total number of configured keys */
  get keyCount(): number {
    return this.keys.length;
  }

  /**
   * Get the next available API key via round-robin.
   * Skips keys that are exhausted or in cooldown.
   * Returns empty string if ALL keys are unavailable.
   */
  getNextKey(): string {
    if (this.keys.length === 0) return '';

    const now = Date.now();
    const totalKeys = this.keys.length;
    let attempts = 0;

    while (attempts < totalKeys) {
      const key = this.keys[this.currentIndex];
      const usage = this.getUsage(key);

      // Reset daily counter if past midnight
      if (now >= usage.resetAt) {
        usage.count = 0;
        usage.resetAt = getMidnightUTC();
      }

      const isExhausted = usage.count >= MAX_REQUESTS_PER_KEY_PER_DAY;
      const isInCooldown = now < usage.cooldownUntil;

      if (!isExhausted && !isInCooldown) {
        // This key is available — advance index for next call, then return
        const selectedIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex + 1) % totalKeys;

        // Log sparingly (every 10th request)
        if (usage.count % 10 === 0 || usage.count === 0) {
          console.log(
            `[KeyManager] Using key #${selectedIndex + 1}/${totalKeys} — ` +
            `${usage.count}/${MAX_REQUESTS_PER_KEY_PER_DAY} requests used today`
          );
        }

        return key;
      }

      // Skip to next key
      this.currentIndex = (this.currentIndex + 1) % totalKeys;
      attempts++;
    }

    // All keys exhausted or in cooldown
    console.error(
      `[KeyManager] ❌ All ${totalKeys} API keys are exhausted or in cooldown!`
    );
    return '';
  }

  /**
   * Mark a key as having been used (increment daily counter).
   */
  markUsed(key: string): void {
    const usage = this.getUsage(key);
    usage.count++;
  }

  /**
   * Mark a key as rate-limited (429). Sets a cooldown period.
   */
  markRateLimited(key: string): void {
    const usage = this.getUsage(key);
    usage.cooldownUntil = Date.now() + KEY_COOLDOWN_MS;
    console.warn(
      `[KeyManager] ⚠️  Key #${this.keys.indexOf(key) + 1} rate-limited — ` +
      `cooldown for ${KEY_COOLDOWN_MS / 1000}s`
    );
  }

  /**
   * Mark a key as fully exhausted for the day (daily quota exceeded).
   */
  markExhausted(key: string): void {
    const usage = this.getUsage(key);
    usage.count = MAX_REQUESTS_PER_KEY_PER_DAY; // Force skip
    console.warn(
      `[KeyManager] 🚫 Key #${this.keys.indexOf(key) + 1} daily quota exhausted`
    );
  }

  /**
   * Get a status snapshot — useful for monitoring/debugging.
   */
  getStatus(): {
    totalKeys: number;
    activeKeys: number;
    exhaustedKeys: number;
    cooldownKeys: number;
    totalRequestsToday: number;
    keys: Array<{
      index: number;
      requestsUsed: number;
      maxRequests: number;
      isExhausted: boolean;
      isInCooldown: boolean;
      cooldownRemainingMs: number;
    }>;
  } {
    const now = Date.now();
    let activeKeys = 0;
    let exhaustedKeys = 0;
    let cooldownKeys = 0;
    let totalRequestsToday = 0;

    const keyStatuses = this.keys.map((key, index) => {
      const usage = this.getUsage(key);

      // Reset daily counter if past midnight
      if (now >= usage.resetAt) {
        usage.count = 0;
        usage.resetAt = getMidnightUTC();
      }

      const isExhausted = usage.count >= MAX_REQUESTS_PER_KEY_PER_DAY;
      const isInCooldown = now < usage.cooldownUntil;
      const cooldownRemainingMs = isInCooldown
        ? usage.cooldownUntil - now
        : 0;

      if (isExhausted) exhaustedKeys++;
      else if (isInCooldown) cooldownKeys++;
      else activeKeys++;

      totalRequestsToday += usage.count;

      return {
        index: index + 1,
        requestsUsed: usage.count,
        maxRequests: MAX_REQUESTS_PER_KEY_PER_DAY,
        isExhausted,
        isInCooldown,
        cooldownRemainingMs,
      };
    });

    return {
      totalKeys: this.keys.length,
      activeKeys,
      exhaustedKeys,
      cooldownKeys,
      totalRequestsToday,
      keys: keyStatuses,
    };
  }

  /**
   * Helper to get or create usage entry for a key.
   */
  private getUsage(key: string): KeyUsage {
    let usage = this.usage.get(key);
    if (!usage) {
      usage = { count: 0, resetAt: getMidnightUTC(), cooldownUntil: 0 };
      this.usage.set(key, usage);
    }
    return usage;
  }
}

// =========================================
// Singleton instance — shared across the process
// =========================================
let instance: ApiKeyManager | null = null;

export function getKeyManager(): ApiKeyManager {
  if (!instance) {
    instance = new ApiKeyManager();
  }
  return instance;
}

export type { ApiKeyManager };
