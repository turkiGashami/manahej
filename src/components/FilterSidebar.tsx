'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { CurriculaFilters } from '@/lib/curricula';
import type { Facets } from '@/lib/curricula';
import {
  DIMENSION_KEYS,
  type DimensionKey,
  buildQuery,
  hasAnyFilter,
  toggleValue,
} from '@/lib/filters';
import { formatNumber, cn } from '@/lib/utils';

const DIM_LABEL_KEYS: Record<DimensionKey, string> = {
  stage: 'filterStage',
  subject: 'filterSubject',
  lang: 'filterLanguage',
  contributor: 'filterContributor',
  grade: 'filterGrade',
};

export function FilterSidebar({
  facets,
  filters,
  basePath,
  lockedDimension,
}: {
  facets: Facets;
  filters: CurriculaFilters;
  basePath: string;
  /** A dimension fixed by the route (e.g. stage on /stage/[slug]) — hidden. */
  lockedDimension?: DimensionKey;
}) {
  const t = useTranslations('browse');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  function navigate(next: CurriculaFilters) {
    // The route-locked dimension is implied by the path; keep it out of the URL.
    const sanitized = lockedDimension ? { ...next, [lockedDimension]: [] } : next;
    const qs = buildQuery(sanitized);
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function onToggle(dim: DimensionKey, value: string) {
    navigate(toggleValue(filters, dim, value));
  }

  function clearAll() {
    navigate({ sort: filters.sort, page: 1 });
  }

  const dimensions = DIMENSION_KEYS.filter((d) => d !== lockedDimension);

  return (
    <aside className="space-y-4" aria-label={t('filters')}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('filters')}</h2>
        {hasAnyFilter(filters) ? (
          <button type="button" onClick={clearAll} className="text-sm text-primary hover:underline">
            {tc('clearFilters')}
          </button>
        ) : null}
      </div>

      {dimensions.map((dim) => {
        const options = facets[dim];
        if (!options || options.length === 0) return null;
        const active = filters[dim] ?? [];
        return (
          <FacetGroup
            key={dim}
            title={t(DIM_LABEL_KEYS[dim])}
            options={options.map((o) => ({
              value: o.value,
              label: locale === 'ar' ? o.name_ar : o.name_en,
              count: o.count,
            }))}
            active={active}
            onToggle={(v) => onToggle(dim, v)}
            formatCount={(n) => formatNumber(n, locale)}
          />
        );
      })}
    </aside>
  );
}

function FacetGroup({
  title,
  options,
  active,
  onToggle,
  formatCount,
}: {
  title: string;
  options: { value: string; label: string; count: number }[];
  active: string[];
  onToggle: (value: string) => void;
  formatCount: (n: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, 6);

  return (
    <fieldset className="card p-3">
      <legend className="px-1 text-sm font-medium text-muted">{title}</legend>
      <ul className="mt-1 space-y-0.5">
        {visible.map((o) => {
          const checked = active.includes(o.value);
          return (
            <li key={o.value}>
              <label
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2',
                  checked && 'text-primary',
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(o.value)}
                    className="h-4 w-4 accent-[rgb(var(--primary))]"
                  />
                  <span className="line-clamp-1">{o.label}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{formatCount(o.count)}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > 6 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 px-2 text-xs text-primary hover:underline"
        >
          {expanded ? '−' : `+${options.length - 6}`}
        </button>
      ) : null}
    </fieldset>
  );
}
