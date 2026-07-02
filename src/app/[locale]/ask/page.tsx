import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AskLibrary } from '@/components/AskLibrary';

// Uses the model at request time.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ask' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function AskPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('ask');

  const examples = [t('example1'), t('example2'), t('example3')];

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <span className="tag">{t('badge')}</span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-muted">{t('subtitle')}</p>
        <div className="mt-8">
          <AskLibrary examples={examples} />
        </div>
      </div>
    </div>
  );
}
