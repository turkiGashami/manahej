'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: string) {
    if (next === locale) return;
    // Read the query at click time (client-only) to preserve it without
    // useSearchParams(), which would force a Suspense boundary at prerender.
    const qs = typeof window !== 'undefined' ? window.location.search : '';
    const href = `${pathname}${qs}`;
    // next-intl's router preserves the current route and swaps the locale.
    router.replace(href, { locale: next });
  }

  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-sm">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-current={l === locale ? 'true' : undefined}
          className={
            l === locale
              ? 'rounded-md bg-primary px-2.5 py-1 font-medium text-primary-fg'
              : 'rounded-md px-2.5 py-1 text-muted hover:text-fg'
          }
        >
          {l === 'ar' ? 'ع' : 'EN'}
        </button>
      ))}
    </div>
  );
}
