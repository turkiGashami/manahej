/** Small shared helpers. */

/** Conditionally join class names (tiny clsx replacement). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Human-readable file size, localized digits handled by the formatter. */
export function formatFileSize(bytes: number | null | undefined, locale: string): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return `${nf.format(value)} ${units[unit]}`;
}

/** Localized integer (e.g. download counts, page counts). */
export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Localized date. */
export function formatDate(value: string | Date | null | undefined, locale: string): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/** Absolute site URL for share links / QR / sitemap. */
export function siteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  return `${base}${path}`;
}

/** Pick the localized title; fall back to Arabic when English is missing. */
export function localizedTitle(
  c: { title_ar: string; title_en?: string | null },
  locale: string,
): string {
  if (locale === 'en') return c.title_en || c.title_ar;
  return c.title_ar;
}

/** URL-safe slug that preserves Arabic letters; caller appends a unique suffix. */
export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[\sـ]+/g, '-') // whitespace + Arabic tatweel → hyphen
    .replace(/[^\p{L}\p{N}-]+/gu, '') // keep Unicode letters/numbers/hyphen
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Pick the localized contributor/author name. */
export function localizedContributorName(
  c: { name_ar: string; name_en?: string | null } | null | undefined,
  locale: string,
): string {
  if (!c) return '';
  if (locale === 'en') return c.name_en || c.name_ar;
  return c.name_ar;
}
