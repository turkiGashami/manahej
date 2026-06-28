import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL, DB_SCHEMA } from './env';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Server Supabase client bound to the request cookies (RLS-aware, runs as the
 * signed-in user). Returns null when env is not configured.
 *
 * Must be called within a request scope (Server Component / Route Handler /
 * Server Action) because it reads/writes cookies via next/headers.
 */
export async function getSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: DB_SCHEMA },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Session refresh is handled in middleware, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Anonymous public client (anon key, no cookies). For contexts without a
 * request scope — e.g. sitemap generation — that only need RLS-public reads.
 */
export function getSupabasePublicClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: DB_SCHEMA },
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

/**
 * Service-role client that BYPASSES RLS. Server-only. Use sparingly for
 * trusted operations (e.g. incrementing download counters, computing facet
 * counts across all published rows). Never import from a Client Component.
 */
export function getSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;

  return createServerClient(SUPABASE_URL, serviceKey, {
    db: { schema: DB_SCHEMA },
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
