import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SUBJECTS, localizedName } from '@/lib/taxonomy';

export async function SubjectGrid() {
  const locale = await getLocale();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {SUBJECTS.map((subject) => (
        <Link
          key={subject.slug}
          href={`/subject/${subject.slug}`}
          className="card flex items-center gap-3 p-3 transition-colors hover:border-primary"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 4h9l3 3v13H6z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M14 4v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-sm font-medium">{localizedName(subject, locale)}</span>
        </Link>
      ))}
    </div>
  );
}
