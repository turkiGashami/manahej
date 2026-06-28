import type { CurriculaFilters, SortKey } from './curricula';

export const DIMENSION_KEYS = ['stage', 'subject', 'lang', 'contributor', 'grade'] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

type RawParams = Record<string, string | string[] | undefined>;

function readList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : value.split(',');
  return raw.map((v) => v.trim()).filter(Boolean);
}

/** Parse Next.js searchParams into a typed filter object. */
export function parseFilters(params: RawParams): CurriculaFilters {
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort: SortKey = sortRaw === 'most_downloaded' ? 'most_downloaded' : 'newest';
  const pageRaw = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(pageRaw ?? '1', 10) || 1);
  const qRaw = Array.isArray(params.q) ? params.q[0] : params.q;

  return {
    stage: readList(params.stage),
    subject: readList(params.subject),
    lang: readList(params.lang),
    contributor: readList(params.contributor),
    grade: readList(params.grade),
    q: qRaw?.trim() || undefined,
    sort,
    page,
  };
}

/** Serialize filters back into a query string (omitting empties + page 1). */
export function buildQuery(filters: CurriculaFilters): string {
  const sp = new URLSearchParams();
  for (const key of DIMENSION_KEYS) {
    const list = filters[key];
    if (list && list.length) sp.set(key, list.join(','));
  }
  if (filters.q) sp.set('q', filters.q);
  if (filters.sort && filters.sort !== 'newest') sp.set('sort', filters.sort);
  if (filters.page && filters.page > 1) sp.set('page', String(filters.page));
  return sp.toString();
}

/** Toggle a value within a dimension, returning a fresh filters object. */
export function toggleValue(
  filters: CurriculaFilters,
  dim: DimensionKey,
  value: string,
): CurriculaFilters {
  const current = filters[dim] ?? [];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  // Any filter change resets pagination to the first page.
  return { ...filters, [dim]: next, page: 1 };
}

export function hasAnyFilter(filters: CurriculaFilters): boolean {
  return (
    DIMENSION_KEYS.some((k) => (filters[k]?.length ?? 0) > 0) || Boolean(filters.q)
  );
}
