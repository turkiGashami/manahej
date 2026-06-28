import 'server-only';
import { getSupabaseServerClient } from './supabase/server';
import type { CurriculumWithRefs } from '@/types/database';

export const PAGE_SIZE = 12;

export type SortKey = 'newest' | 'most_downloaded';

export type CurriculaFilters = {
  stage?: string[];
  subject?: string[];
  lang?: string[];
  contributor?: string[];
  grade?: string[];
  q?: string;
  sort?: SortKey;
  page?: number;
};

export type ListResult = {
  items: CurriculumWithRefs[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type FacetOption = {
  value: string;
  name_ar: string;
  name_en: string;
  count: number;
};

export type Facets = {
  stage: FacetOption[];
  subject: FacetOption[];
  lang: FacetOption[];
  contributor: FacetOption[];
  grade: FacetOption[];
};

// FK columns are NOT NULL, so inner joins are safe and enable filtering on the
// embedded resource (e.g. `stage.slug`).
const SELECT_WITH_REFS = `
  *,
  stage:stages!inner(slug,name_ar,name_en),
  subject:subjects!inner(slug,name_ar,name_en),
  language:languages!inner(code,name_ar,name_en,direction),
  contributor:contributors!inner(name_ar,name_en,type)
`;

const EMPTY_LIST: ListResult = {
  items: [],
  total: 0,
  page: 1,
  pageSize: PAGE_SIZE,
  pageCount: 0,
};

const EMPTY_FACETS: Facets = {
  stage: [],
  subject: [],
  lang: [],
  contributor: [],
  grade: [],
};

/** Apply text + dimension filters. `skip` omits one dimension (for facets). */
function applyFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters: CurriculaFilters,
  skip?: keyof Facets,
) {
  if (skip !== 'stage' && filters.stage?.length) query = query.in('stage.slug', filters.stage);
  if (skip !== 'subject' && filters.subject?.length) query = query.in('subject.slug', filters.subject);
  if (skip !== 'lang' && filters.lang?.length) query = query.in('language.code', filters.lang);
  if (skip !== 'contributor' && filters.contributor?.length)
    query = query.in('contributor.name_ar', filters.contributor);
  if (skip !== 'grade' && filters.grade?.length) query = query.in('grade', filters.grade);

  const q = filters.q?.trim();
  if (q) {
    const safe = q.replace(/[%,()]/g, ' ');
    query = query.or(
      `title_ar.ilike.%${safe}%,title_en.ilike.%${safe}%,description.ilike.%${safe}%`,
    );
  }
  return query;
}

/** Paginated, filtered, sorted list of published curricula. */
export async function listCurricula(filters: CurriculaFilters): Promise<ListResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return EMPTY_LIST;

  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('curricula')
    .select(SELECT_WITH_REFS, { count: 'exact' })
    .eq('status', 'published');

  query = applyFilters(query, filters);

  query =
    filters.sort === 'most_downloaded'
      ? query.order('download_count', { ascending: false })
      : query.order('created_at', { ascending: false });

  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) {
    console.error('listCurricula error:', error.message);
    return EMPTY_LIST;
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as CurriculumWithRefs[],
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

/** Faceted counts per dimension, each excluding its own active filter. */
export async function getFacets(filters: CurriculaFilters): Promise<Facets> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return EMPTY_FACETS;

  // Pull a capped projection per dimension and tally in JS. Fine for MVP sizes.
  const CAP = 2000;

  async function tally<T extends keyof Facets>(dim: T): Promise<FacetOption[]> {
    let query = supabase!
      .from('curricula')
      .select(SELECT_WITH_REFS)
      .eq('status', 'published')
      .limit(CAP);
    query = applyFilters(query, filters, dim);

    const { data, error } = await query;
    if (error || !data) return [];

    const map = new Map<string, FacetOption>();
    for (const row of data as unknown as CurriculumWithRefs[]) {
      let value: string | null | undefined;
      let name_ar = '';
      let name_en = '';
      switch (dim) {
        case 'stage':
          value = row.stage?.slug;
          name_ar = row.stage?.name_ar ?? '';
          name_en = row.stage?.name_en ?? '';
          break;
        case 'subject':
          value = row.subject?.slug;
          name_ar = row.subject?.name_ar ?? '';
          name_en = row.subject?.name_en ?? '';
          break;
        case 'lang':
          value = row.language?.code;
          name_ar = row.language?.name_ar ?? '';
          name_en = row.language?.name_en ?? '';
          break;
        case 'contributor':
          value = row.contributor?.name_ar;
          name_ar = row.contributor?.name_ar ?? '';
          name_en = row.contributor?.name_en ?? row.contributor?.name_ar ?? '';
          break;
        case 'grade':
          value = row.grade ?? undefined;
          name_ar = row.grade ?? '';
          name_en = row.grade ?? '';
          break;
      }
      if (!value) continue;
      const existing = map.get(value);
      if (existing) existing.count += 1;
      else map.set(value, { value, name_ar, name_en, count: 1 });
    }
    // Hide zero-count options (they simply won't appear) and sort by count desc.
    return [...map.values()].sort((a, b) => b.count - a.count);
  }

  const [stage, subject, lang, contributor, grade] = await Promise.all([
    tally('stage'),
    tally('subject'),
    tally('lang'),
    tally('contributor'),
    tally('grade'),
  ]);

  return { stage, subject, lang, contributor, grade };
}

/** Single published curriculum by slug (also visible to owner/admin via RLS). */
export async function getCurriculumBySlug(
  slug: string,
): Promise<CurriculumWithRefs | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('curricula')
    .select(SELECT_WITH_REFS)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getCurriculumBySlug error:', error.message);
    return null;
  }
  return (data as unknown as CurriculumWithRefs) ?? null;
}

/** Related curricula: same subject or stage, excluding the current one. */
export async function getRelatedCurricula(
  current: Pick<CurriculumWithRefs, 'id' | 'stage' | 'subject'>,
  limit = 6,
): Promise<CurriculumWithRefs[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase || (!current.subject?.slug && !current.stage?.slug)) return [];

  let query = supabase
    .from('curricula')
    .select(SELECT_WITH_REFS)
    .eq('status', 'published')
    .neq('id', current.id)
    .limit(limit);

  if (current.subject?.slug) query = query.eq('subject.slug', current.subject.slug);
  else if (current.stage?.slug) query = query.eq('stage.slug', current.stage.slug);

  const { data, error } = await query.order('download_count', { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as CurriculumWithRefs[];
}

/** Discovery rows for the home page. */
export async function getDiscoveryRows(): Promise<{
  latest: CurriculumWithRefs[];
  mostDownloaded: CurriculumWithRefs[];
  editorPicks: CurriculumWithRefs[];
}> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { latest: [], mostDownloaded: [], editorPicks: [] };

  const base = () =>
    supabase.from('curricula').select(SELECT_WITH_REFS).eq('status', 'published').limit(12);

  const [latest, mostDownloaded, editorPicks] = await Promise.all([
    base().order('created_at', { ascending: false }),
    // NOTE: simple proxy. For the brief's rolling 30-day ranking, add an RPC
    // aggregating curriculum_downloads over the last 30 days.
    base().order('download_count', { ascending: false }),
    base().eq('is_editor_pick', true).order('created_at', { ascending: false }),
  ]);

  return {
    latest: (latest.data ?? []) as unknown as CurriculumWithRefs[],
    mostDownloaded: (mostDownloaded.data ?? []) as unknown as CurriculumWithRefs[],
    editorPicks: (editorPicks.data ?? []) as unknown as CurriculumWithRefs[],
  };
}
