'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * In-browser PDF preview via the native viewer (iframe). Dependency-free and
 * works everywhere. To show only the first N pages, swap this for a
 * react-pdf / pdf.js renderer (the page passes the same `url`).
 */
export function PdfPreview({ url }: { url: string | null }) {
  const t = useTranslations('curriculum');
  const [loaded, setLoaded] = useState(false);

  if (!url) {
    return (
      <div className="card grid aspect-[3/4] w-full place-items-center text-muted">
        {t('preview')} —
      </div>
    );
  }

  return (
    <div className="card relative overflow-hidden">
      {!loaded ? (
        <div className="absolute inset-0 grid place-items-center text-muted">…</div>
      ) : null}
      <iframe
        src={`${url}#view=FitH`}
        title={t('preview')}
        onLoad={() => setLoaded(true)}
        className="h-[70vh] max-h-[800px] w-full bg-surface-2"
      />
    </div>
  );
}
