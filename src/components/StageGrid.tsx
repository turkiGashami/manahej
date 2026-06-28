import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { STAGES, localizedName } from '@/lib/taxonomy';

export async function StageGrid() {
  const locale = await getLocale();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {STAGES.map((stage) => (
        <Link
          key={stage.slug}
          href={`/stage/${stage.slug}`}
          className="card group flex flex-col gap-2 p-4 transition-colors hover:border-primary"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 9.5 12 4l9 5.5-9 5.5-9-5.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M7 12v4.2c0 .5.3 1 .8 1.2 1.2.6 2.7 1.1 4.2 1.1s3-.5 4.2-1.1c.5-.2.8-.7.8-1.2V12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-medium group-hover:text-primary">
            {localizedName(stage, locale)}
          </span>
        </Link>
      ))}
    </div>
  );
}
