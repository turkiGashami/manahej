import { getTranslations, getLocale } from 'next-intl/server';
import { getRelatedCurricula } from '@/lib/curricula';
import type { CurriculumWithRefs } from '@/types/database';
import { CurriculumCard } from './CurriculumCard';

export async function RelatedCurricula({
  current,
}: {
  current: Pick<CurriculumWithRefs, 'id' | 'stage' | 'subject'>;
}) {
  const [items, t, locale] = await Promise.all([
    getRelatedCurricula(current),
    getTranslations('curriculum'),
    getLocale(),
  ]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold">{t('related')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((c) => (
          <CurriculumCard key={c.id} curriculum={c} locale={locale} />
        ))}
      </div>
    </section>
  );
}
