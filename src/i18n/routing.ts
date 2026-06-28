import { defineRouting } from 'next-intl/routing';

export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix the locale in the URL (/ar, /en) so links are shareable
  // and indexable, as the brief requires.
  localePrefix: 'always',
});

export function dirForLocale(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Type guard for a supported locale (next-intl 3.x has no `hasLocale`). */
export function isValidLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
