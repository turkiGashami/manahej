/** Centralized Supabase env access with a "configured?" guard. */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when the public Supabase env vars are present. The app is built to
 * degrade gracefully when this is false (taxonomy still renders; curricula
 * lists show an empty/placeholder state) so it runs before a backend exists.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const PDF_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PDF_BUCKET || 'curricula';
export const COVER_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_COVER_BUCKET || 'covers';

/**
 * Postgres schema the app's tables live in. Defaults to 'public'. Set to a
 * dedicated schema (e.g. 'manahej') when sharing a project with other apps.
 */
export const DB_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA || 'public';
