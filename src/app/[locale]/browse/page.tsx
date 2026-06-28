import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CurriculaListing } from '@/components/CurriculaListing';
import { parseFilters } from '@/lib/filters';

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'browse' });
  return { title: t('title') };
}

export default async function BrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const t = await getTranslations('browse');

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <CurriculaListing filters={filters} basePath="/browse" params={sp} />
    </div>
  );
}
