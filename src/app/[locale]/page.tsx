import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SearchBar } from '@/components/SearchBar';
import { StageGrid } from '@/components/StageGrid';
import { SubjectGrid } from '@/components/SubjectGrid';
import { DiscoveryRow } from '@/components/DiscoveryRow';
import { getDiscoveryRows } from '@/lib/curricula';
import { STAGES, SUBJECTS } from '@/lib/taxonomy';
import { formatNumber } from '@/lib/utils';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const discovery = await getDiscoveryRows();

  const hasDiscovery =
    discovery.latest.length + discovery.mostDownloaded.length + discovery.editorPicks.length > 0;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-2/3 bg-gradient-to-b from-primary/10 to-transparent"
        />
        <div className="container-page relative py-16 text-center sm:py-24">
          <span className="tag">{t('heroBadge')}</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.15] sm:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted">
            {t('heroSubtitle')}
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/browse" className="btn-primary">
              {t('ctaBrowse')}
            </Link>
            <a href="#stages" className="btn-ghost">
              {t('ctaStages')}
            </a>
          </div>

          <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4">
            <Stat value={formatNumber(STAGES.length, locale)} label={t('statStages')} />
            <Stat value={formatNumber(SUBJECTS.length, locale)} label={t('statSubjects')} />
            <Stat value="100%" label={t('statFree')} />
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------------- About */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="tag">{t('aboutTag')}</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t('aboutTitle')}</h2>
            <p className="mt-4 leading-relaxed text-muted">{t('aboutBody')}</p>
            <ul className="mt-6 space-y-3">
              {[t('aboutPoint1'), t('aboutPoint2'), t('aboutPoint3')].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckBadge />
                  <span className="font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <AboutVisual />
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section className="border-y border-border bg-surface-2/40">
        <div className="container-page py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="tag">{t('featuresTag')}</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              {t('featuresTitle')}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon="layers" title={t('feature1Title')} body={t('feature1Body')} />
            <Feature icon="eye" title={t('feature2Title')} body={t('feature2Body')} />
            <Feature icon="search" title={t('feature3Title')} body={t('feature3Body')} />
            <Feature icon="globe" title={t('feature4Title')} body={t('feature4Body')} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Browse by stage */}
      <section id="stages" className="container-page scroll-mt-20 py-16">
        <SectionHeading title={t('browseByStage')} hint={t('browseByStageHint')} />
        <StageGrid />
      </section>

      {/* --------------------------------------------------- Browse by subject */}
      <section className="container-page py-4 pb-16">
        <SectionHeading title={t('browseBySubject')} hint={t('browseBySubjectHint')} />
        <SubjectGrid />
      </section>

      {/* ------------------------------------------------------------ Discovery */}
      {hasDiscovery ? (
        <section className="border-t border-border bg-surface-2/40">
          <div className="container-page space-y-12 py-16">
            <DiscoveryRow
              title={t('latest')}
              items={discovery.latest}
              viewAllHref="/browse?sort=newest"
              viewAllLabel={t('viewAll')}
              locale={locale}
            />
            <DiscoveryRow
              title={t('mostDownloaded')}
              items={discovery.mostDownloaded}
              viewAllHref="/browse?sort=most_downloaded"
              viewAllLabel={t('viewAll')}
              locale={locale}
            />
            <DiscoveryRow
              title={t('editorPicks')}
              items={discovery.editorPicks}
              viewAllHref="/browse"
              viewAllLabel={t('viewAll')}
              locale={locale}
            />
          </div>
        </section>
      ) : null}

      {/* ----------------------------------------------------------- Contribute */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/12 via-surface to-accent/12 p-8 text-center shadow-md sm:p-14">
          <span className="tag">{t('contributeTag')}</span>
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
            {t('contributeTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{t('contributeBody')}</p>
          <Link href="/upload" className="btn-primary mt-7">
            {t('contributeCta')}
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------ FAQ */}
      <section className="container-page pb-20">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">{t('faqTitle')}</h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          <FaqItem q={t('faq1Q')} a={t('faq1A')} />
          <FaqItem q={t('faq2Q')} a={t('faq2A')} />
          <FaqItem q={t('faq3Q')} a={t('faq3A')} />
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ helpers */

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      {hint ? <p className="mt-1 text-muted">{hint}</p> : null}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 px-3 py-4 backdrop-blur">
      <dd className="font-display text-3xl font-bold text-primary">{value}</dd>
      <dt className="mt-1 text-xs text-muted">{label}</dt>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: 'layers' | 'eye' | 'search' | 'globe';
  title: string;
  body: string;
}) {
  return (
    <div className="card p-5 transition-shadow hover:shadow-lg">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <FeatureIcon name={icon} />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-medium">
        {q}
        <span className="text-muted transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{a}</p>
    </details>
  );
}

function CheckBadge() {
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function AboutVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md" aria-hidden>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 bg-dots" />
      {/* Stacked "PDF cover" cards */}
      <div className="absolute start-8 top-8 h-40 w-32 -rotate-6 rounded-xl border border-border bg-surface shadow-lg sm:h-48 sm:w-36" />
      <div className="absolute start-1/2 top-6 h-44 w-32 -translate-x-1/2 rounded-xl border border-border bg-surface shadow-lg sm:h-52 sm:w-36 rtl:translate-x-1/2" />
      <div className="absolute end-8 top-8 h-40 w-32 rotate-6 rounded-xl border border-border bg-surface shadow-lg sm:h-48 sm:w-36">
        <div className="m-3 h-2 w-1/2 rounded bg-primary/30" />
        <div className="mx-3 h-2 w-2/3 rounded bg-muted/30" />
      </div>
    </div>
  );
}

function FeatureIcon({ name }: { name: 'layers' | 'eye' | 'search' | 'globe' }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true } as const;
  switch (name) {
    case 'layers':
      return (
        <svg {...common}>
          <path d="M12 3 3 8l9 5 9-5-9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
  }
}
