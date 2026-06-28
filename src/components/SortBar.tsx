'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { CurriculaFilters, SortKey } from '@/lib/curricula';
import { buildQuery } from '@/lib/filters';
import { cn } from '@/lib/utils';

export function SortBar({
  filters,
  basePath,
  total,
}: {
  filters: CurriculaFilters;
  basePath: string;
  total: number;
}) {
  const t = useTranslations('browse');
  const tc = useTranslations('common');
  const router = useRouter();
  const current: SortKey = filters.sort ?? 'newest';

  function setSort(sort: SortKey) {
    const qs = buildQuery({ ...filters, sort, page: 1 });
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const options: { key: SortKey; label: string }[] = [
    { key: 'newest', label: t('sortNewest') },
    { key: 'most_downloaded', label: t('sortMostDownloaded') },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        {total} {tc('results')}
      </p>
      <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-sm">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setSort(o.key)}
            aria-pressed={current === o.key}
            className={cn(
              'rounded-md px-3 py-1.5',
              current === o.key
                ? 'bg-primary font-medium text-primary-fg'
                : 'text-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
