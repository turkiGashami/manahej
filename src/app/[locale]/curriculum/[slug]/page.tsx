import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PdfPreview } from '@/components/PdfPreview';
import { DownloadButton } from '@/components/DownloadButton';
import { QrShare } from '@/components/QrShare';
import { ReportDialog } from '@/components/ReportDialog';
import { RelatedCurricula } from '@/components/RelatedCurricula';
import { getCurriculumBySlug } from '@/lib/curricula';
import { localizedName } from '@/lib/taxonomy';
import {
  formatDate,
  formatFileSize,
  formatNumber,
  localizedContributorName,
  localizedTitle,
  siteUrl,
} from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = await getCurriculumBySlug(slug);
  if (!c) return {};
  const title = localizedTitle(c, locale);
  const description = c.description?.slice(0, 200) || undefined;
  const path = `/${locale}/curriculum/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      type: 'article',
      images: c.cover_url ? [{ url: c.cover_url }] : undefined,
    },
  };
}

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const c = await getCurriculumBySlug(slug);
  if (!c) notFound();

  const t = await getTranslations('curriculum');
  const tc = await getTranslations('common');

  const title = localizedTitle(c, locale);
  const author = localizedContributorName(c.contributor, locale);
  const shareUrl = siteUrl(`/${locale}/curriculum/${slug}`);

  const details: { label: string; value: string | null }[] = [
    { label: tc('stage'), value: c.stage ? localizedName(c.stage, locale) : null },
    { label: tc('subject'), value: c.subject ? localizedName(c.subject, locale) : null },
    { label: tc('grade'), value: c.grade },
    { label: tc('language'), value: c.language ? localizedName(c.language, locale) : null },
    {
      label: tc('pages'),
      value: c.page_count ? formatNumber(c.page_count, locale) : null,
    },
    { label: tc('version'), value: c.version },
    { label: t('fileSize'), value: formatFileSize(c.file_size, locale) },
    { label: tc('addedOn'), value: formatDate(c.created_at, locale) },
    {
      label: tc('downloads'),
      value: formatNumber(c.download_count, locale),
    },
  ];

  const sizeText = formatFileSize(c.file_size, locale);
  const quickFacts = [
    c.page_count ? `${formatNumber(c.page_count, locale)} ${locale === 'ar' ? 'صفحة' : 'pages'}` : null,
    sizeText !== '—' ? sizeText : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="container-page py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted" aria-label="breadcrumb">
        <Link href="/browse" className="hover:text-fg">
          {tc('browseAll')}
        </Link>
        {c.stage ? (
          <>
            <span aria-hidden>/</span>
            <Link href={`/stage/${c.stage.slug}`} className="hover:text-fg">
              {localizedName(c.stage, locale)}
            </Link>
          </>
        ) : null}
        {c.subject ? (
          <>
            <span aria-hidden>/</span>
            <Link href={`/subject/${c.subject.slug}`} className="hover:text-fg">
              {localizedName(c.subject, locale)}
            </Link>
          </>
        ) : null}
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {author ? <p className="mt-1 text-muted">{author}</p> : null}
      </header>

      {/* Mobile-first: action (cover + download) → about + preview → details.
          On large screens this becomes a content column + sticky sidebar. */}
      <div className="space-y-6 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8 lg:space-y-0">
        {/* A — action: cover + download + quick facts (top on mobile) */}
        <div className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24">
          <div className="card p-4">
            <div className="flex gap-4 lg:block">
              <div className="w-28 shrink-0 lg:mb-4 lg:w-full">
                <CoverThumb url={c.cover_url} title={title} />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2">
                <DownloadButton curriculumId={c.id} pdfUrl={c.pdf_url} />
                {quickFacts ? (
                  <p className="text-center text-xs text-muted">{quickFacts}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* B — about + preview (main content) */}
        <div className="space-y-6 lg:col-start-1 lg:row-start-1 lg:row-span-2">
          {c.description ? (
            <section>
              <h2 className="mb-2 text-lg font-semibold">{t('about')}</h2>
              <p className="whitespace-pre-line leading-relaxed text-fg/90">{c.description}</p>
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-lg font-semibold">{t('preview')}</h2>
            <PdfPreview url={c.pdf_url} />
          </section>
        </div>

        {/* C — full details + share + report */}
        <div className="space-y-4 lg:col-start-2 lg:row-start-2">
          <dl className="card divide-y divide-border text-sm">
            {details
              .filter((d) => d.value)
              .map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-muted">{d.label}</dt>
                  <dd className="text-end font-medium">{d.value}</dd>
                </div>
              ))}
          </dl>

          <QrShare url={shareUrl} />

          <div className="px-1">
            <ReportDialog curriculumId={c.id} />
          </div>
        </div>
      </div>

      <RelatedCurricula current={c} />
    </div>
  );
}

function CoverThumb({ url, title }: { url: string | null; title: string }) {
  return (
    <div className="aspect-[3/4] overflow-hidden rounded-lg border border-border bg-surface-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15">
          <span className="text-3xl font-bold text-primary/40">
            {title?.trim()?.charAt(0) ?? '؟'}
          </span>
        </div>
      )}
    </div>
  );
}
