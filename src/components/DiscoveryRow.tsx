import { Link } from '@/i18n/navigation';
import type { CurriculumWithRefs } from '@/types/database';
import { CurriculumCard } from './CurriculumCard';

export function DiscoveryRow({
  title,
  items,
  viewAllHref,
  viewAllLabel,
  locale,
}: {
  title: string;
  items: CurriculumWithRefs[];
  viewAllHref: string;
  viewAllLabel: string;
  locale: string;
}) {
  if (!items.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href={viewAllHref} className="text-sm text-primary hover:underline">
          {viewAllLabel}
        </Link>
      </div>
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {items.map((c) => (
          <div key={c.id} className="w-40 shrink-0 snap-start sm:w-44">
            <CurriculumCard curriculum={c} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}
