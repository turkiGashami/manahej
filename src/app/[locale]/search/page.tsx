import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CurriculaListing } from '@/components/CurriculaListing';
import { SearchBar } from '@/components/SearchBar';
import { parseFilters } from '@/lib/filters';

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return { title: t('search') };
}

export default async function SearchPage({
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
  const t = await getTranslations('common');
  const q = filters.q ?? '';

  return (
    <div className="container-page py-8">
      <h1 className="mb-1 text-2xl font-bold">{t('search')}</h1>
      {q ? (
        <p className="mb-4 text-muted">
          {locale === 'ar' ? 'نتائج عن:' : 'Results for:'}{' '}
          <span className="font-medium text-fg">“{q}”</span>
        </p>
      ) : null}
      <div className="mb-6 max-w-xl">
        <SearchBar />
      </div>
      <CurriculaListing filters={filters} basePath="/search" params={sp} />
    </div>
  );
}
