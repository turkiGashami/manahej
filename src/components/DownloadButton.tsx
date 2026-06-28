'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { incrementDownload } from '@/app/actions';

export function DownloadButton({
  curriculumId,
  pdfUrl,
}: {
  curriculumId: string;
  pdfUrl: string | null;
}) {
  const t = useTranslations('curriculum');
  const [pending, startTransition] = useTransition();

  function onDownload() {
    if (!pdfUrl) return;
    // Open the file immediately (user gesture), then log the download.
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    startTransition(async () => {
      await incrementDownload(curriculumId);
    });
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={!pdfUrl || pending}
      className="btn-primary w-full disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {t('downloadPdf')}
    </button>
  );
}
