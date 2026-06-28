import { getTranslations } from 'next-intl/server';
import type { CurriculumWithRefs } from '@/types/database';
import { CurriculumCard } from './CurriculumCard';

export async function CurriculumGrid({
  items,
  locale,
}: {
  items: CurriculumWithRefs[];
  locale: string;
}) {
  const t = await getTranslations('common');

  if (items.length === 0) {
    return (
      <div className="card grid place-items-center gap-2 p-12 text-center text-muted">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p>{t('noResults')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((c) => (
        <CurriculumCard key={c.id} curriculum={c} locale={locale} />
      ))}
    </div>
  );
}
