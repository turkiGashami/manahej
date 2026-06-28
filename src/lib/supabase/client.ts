'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, DB_SCHEMA } from './env';

/**
 * Browser Supabase client (singleton). Only call from Client Components.
 * Returns null when env is not configured so callers can no-op gracefully.
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      db: { schema: DB_SCHEMA },
    });
  }
  return browserClient;
}
