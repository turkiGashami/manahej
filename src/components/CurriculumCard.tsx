import { Link } from '@/i18n/navigation';
import type { CurriculumWithRefs } from '@/types/database';
import {
  formatNumber,
  localizedContributorName,
  localizedTitle,
} from '@/lib/utils';
import { localizedName } from '@/lib/taxonomy';

export function CurriculumCard({
  curriculum,
  locale,
}: {
  curriculum: CurriculumWithRefs;
  locale: string;
}) {
  const title = localizedTitle(curriculum, locale);
  const author = localizedContributorName(curriculum.contributor, locale);
  const stage = curriculum.stage ? localizedName(curriculum.stage, locale) : null;
  const subject = curriculum.subject ? localizedName(curriculum.subject, locale) : null;
  const langLabel = curriculum.language?.code?.toUpperCase();

  return (
    <Link
      href={`/curriculum/${curriculum.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-2">
        {curriculum.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={curriculum.cover_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <CoverPlaceholder title={title} />
        )}
        {langLabel ? (
          <span className="absolute end-2 top-2 rounded-md bg-bg/80 px-1.5 py-0.5 text-[11px] font-medium text-fg backdrop-blur">
            {langLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
          {title}
        </h3>
        {author ? <p className="text-sm text-muted line-clamp-1">{author}</p> : null}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {stage ? <span className="chip">{stage}</span> : null}
          {subject ? <span className="chip">{subject}</span> : null}
        </div>

        {curriculum.page_count ? (
          <p className="pt-1 text-xs text-muted">
            {formatNumber(curriculum.page_count, locale)}{' '}
            {locale === 'ar' ? 'صفحة' : 'pages'}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function CoverPlaceholder({ title }: { title: string }) {
  const initial = title?.trim()?.charAt(0) ?? '؟';
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15">
      <span className="text-4xl font-bold text-primary/40">{initial}</span>
    </div>
  );
}
