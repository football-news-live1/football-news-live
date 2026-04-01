import { NextResponse } from 'next/server';
import { getKeyManager } from '@/lib/key-manager';
import { getFallbackKeyStatus } from '@/lib/fallback-api';

/**
 * GET /api/key-status
 * Returns the current API key manager status for monitoring.
 * Shows key count, usage per key, and active/exhausted/cooldown counts.
 * Does NOT expose actual key values.
 */
export async function GET() {
  try {
    const keyManager = getKeyManager();
    const primaryStatus = keyManager.getStatus();
    const fallbackStatus = getFallbackKeyStatus();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      primary: {
        provider: 'api-football.com',
        ...primaryStatus,
      },
      fallback: {
        provider: 'football-data.org',
        keys: fallbackStatus,
      },
    });
  } catch (error) {
    console.error('Key status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get key status' },
      { status: 500 }
    );
  }
}
