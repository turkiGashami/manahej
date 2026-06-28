import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CurriculaListing } from '@/components/CurriculaListing';
import { parseFilters } from '@/lib/filters';
import { SUBJECTS, subjectBySlug, localizedName } from '@/lib/taxonomy';

type SearchParams = Record<string, string | string[] | undefined>;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subjectSlug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; subjectSlug: string }>;
}): Promise<Metadata> {
  const { locale, subjectSlug } = await params;
  const subject = subjectBySlug(subjectSlug);
  if (!subject) return {};
  return { title: localizedName(subject, locale) };
}

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; subjectSlug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, subjectSlug } = await params;
  setRequestLocale(locale);

  const subject = subjectBySlug(subjectSlug);
  if (!subject) notFound();

  const sp = await searchParams;
  const filters = { ...parseFilters(sp), subject: [subjectSlug] };

  return (
    <div className="container-page py-8">
      <p className="text-sm text-muted">{locale === 'ar' ? 'المادة' : 'Subject'}</p>
      <h1 className="mb-6 text-2xl font-bold">{localizedName(subject, locale)}</h1>
      <CurriculaListing
        filters={filters}
        basePath={`/subject/${subjectSlug}`}
        lockedDimension="subject"
        params={sp}
      />
    </div>
  );
}
