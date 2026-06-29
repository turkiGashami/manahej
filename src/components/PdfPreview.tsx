'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

/**
 * In-browser PDF preview via the native viewer (iframe). Dependency-free and
 * works everywhere. On phones the embedded viewer is cramped, so we also offer
 * an "open in a new tab" link. To show only the first N pages, swap this for a
 * react-pdf / pdf.js renderer (the page passes the same `url`).
 */
export function PdfPreview({ url }: { url: string | null }) {
  const t = useTranslations('curriculum');
  const locale = useLocale();
  const [loaded, setLoaded] = useState(false);

  if (!url) {
    return (
      <div className="card grid aspect-[3/4] w-full place-items-center text-muted sm:aspect-video">
        {t('preview')} —
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="card relative overflow-hidden">
        {!loaded ? (
          <div className="absolute inset-0 grid place-items-center text-muted">…</div>
        ) : null}
        <iframe
          src={`${url}#view=FitH`}
          title={t('preview')}
          onLoad={() => setLoaded(true)}
          className="h-[58vh] w-full bg-surface-2 sm:h-[68vh] lg:h-[74vh]"
          style={{ maxHeight: 820 }}
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M14 4h6v6M20 4l-9 9M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {locale === 'ar' ? 'فتح المعاينة في نافذة جديدة' : 'Open preview in a new tab'}
      </a>
    </div>
  );
}
