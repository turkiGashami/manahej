import { getLocale } from 'next-intl/server';
import { listCurricula, getFacets, type CurriculaFilters } from '@/lib/curricula';
import type { DimensionKey } from '@/lib/filters';
import { FilterSidebar } from './FilterSidebar';
import { SortBar } from './SortBar';
import { CurriculumGrid } from './CurriculumGrid';
import { Pagination } from './Pagination';

/**
 * Full listing experience: faceted filters + sort + grid + pagination.
 * Used by /browse, /stage/[slug], /subject/[slug] and /search.
 */
export async function CurriculaListing({
  filters,
  basePath,
  lockedDimension,
  params,
}: {
  filters: CurriculaFilters;
  basePath: string;
  lockedDimension?: DimensionKey;
  /** Raw searchParams to preserve in pagination links. */
  params: Record<string, string | string[] | undefined>;
}) {
  const locale = await getLocale();
  const [list, facets] = await Promise.all([listCurricula(filters), getFacets(filters)]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <FilterSidebar
        facets={facets}
        filters={filters}
        basePath={basePath}
        lockedDimension={lockedDimension}
      />

      <div className="space-y-4">
        <SortBar filters={filters} basePath={basePath} total={list.total} />
        <CurriculumGrid items={list.items} locale={locale} />
        <Pagination
          page={list.page}
          pageCount={list.pageCount}
          basePath={basePath}
          params={params}
        />
      </div>
    </div>
  );
}
