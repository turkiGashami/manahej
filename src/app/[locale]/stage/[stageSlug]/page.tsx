import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CurriculaListing } from '@/components/CurriculaListing';
import { parseFilters } from '@/lib/filters';
import { STAGES, stageBySlug, localizedName } from '@/lib/taxonomy';

type SearchParams = Record<string, string | string[] | undefined>;

export function generateStaticParams() {
  return STAGES.map((s) => ({ stageSlug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; stageSlug: string }>;
}): Promise<Metadata> {
  const { locale, stageSlug } = await params;
  const stage = stageBySlug(stageSlug);
  if (!stage) return {};
  return { title: localizedName(stage, locale) };
}

export default async function StagePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; stageSlug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, stageSlug } = await params;
  setRequestLocale(locale);

  const stage = stageBySlug(stageSlug);
  if (!stage) notFound();

  const sp = await searchParams;
  const filters = { ...parseFilters(sp), stage: [stageSlug] };

  return (
    <div className="container-page py-8">
      <p className="text-sm text-muted">{locale === 'ar' ? 'المرحلة' : 'Stage'}</p>
      <h1 className="mb-6 text-2xl font-bold">{localizedName(stage, locale)}</h1>
      <CurriculaListing
        filters={filters}
        basePath={`/stage/${stageSlug}`}
        lockedDimension="stage"
        params={sp}
      />
    </div>
  );
}
