import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './lib/supabase/env';

const handleIntl = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // next-intl handles locale detection and the /ar, /en prefixes.
  const response = handleIntl(request);

  // Refresh the Supabase auth token (when configured) and propagate the
  // rotated cookies onto the response so Server Components see a fresh session.
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // Match all paths except API routes, Next internals, and files with an
  // extension (e.g. .pdf, .png, favicon.ico).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
