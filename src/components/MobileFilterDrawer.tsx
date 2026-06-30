'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FilterSidebar } from './FilterSidebar';
import type { CurriculaFilters, Facets } from '@/lib/curricula';
import { DIMENSION_KEYS, type DimensionKey } from '@/lib/filters';
import { cn, formatNumber } from '@/lib/utils';

/**
 * Mobile-only filters: a button that opens a bottom sheet (drawer) containing
 * the FilterSidebar. The desktop side column is rendered separately.
 */
export function MobileFilterDrawer({
  facets,
  filters,
  basePath,
  lockedDimension,
}: {
  facets: Facets;
  filters: CurriculaFilters;
  basePath: string;
  lockedDimension?: DimensionKey;
}) {
  const t = useTranslations('browse');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const closeLabel = locale === 'ar' ? 'إغلاق' : 'Close';

  const activeCount =
    DIMENSION_KEYS.filter((k) => k !== lockedDimension).reduce(
      (n, k) => n + (filters[k]?.length ?? 0),
      0,
    ) + (filters.q ? 1 : 0);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost w-full justify-center"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 5h16M7 12h10M10 19h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        {t('filters')}
        {activeCount > 0 ? (
          <span className="ms-1 rounded-full bg-primary px-1.5 text-xs text-primary-fg">
            {formatNumber(activeCount, locale)}
          </span>
        ) : null}
      </button>

      {/* Overlay (kept mounted for the slide transition) */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          open ? '' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label={closeLabel}
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/45 transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('filters')}
          className={cn(
            'absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col rounded-t-2xl border-t border-border bg-surface transition-transform duration-300',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-base font-semibold">{t('filters')}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FilterSidebar
              facets={facets}
              filters={filters}
              basePath={basePath}
              lockedDimension={lockedDimension}
              hideHeading
            />
          </div>

          <div className="border-t border-border p-3">
            <button type="button" onClick={() => setOpen(false)} className="btn-primary w-full">
              {locale === 'ar' ? 'عرض النتائج' : 'Show results'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
