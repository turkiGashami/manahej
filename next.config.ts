import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root so a stray lockfile elsewhere (e.g. in $HOME)
  // doesn't get inferred as the root.
  outputFileTracingRoot: projectRoot,
  images: {
    // Supabase Storage public bucket host is added at deploy time via env.
    // Pattern is permissive in dev; tighten for production.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
  },
};

export default withNextIntl(nextConfig);
