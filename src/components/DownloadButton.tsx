'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { incrementDownload } from '@/app/actions';

export function DownloadButton({
  curriculumId,
  pdfUrl,
  fileName,
}: {
  curriculumId: string;
  pdfUrl: string | null;
  fileName?: string;
}) {
  const t = useTranslations('curriculum');
  const tc = useTranslations('common');
  const [pending, startTransition] = useTransition();

  const name = (fileName && fileName.trim()) || 'curriculum.pdf';

  async function triggerDownload() {
    if (!pdfUrl) return;
    try {
      // Fetch as a blob so the browser saves the file directly instead of
      // navigating to (previewing) it. Works cross-origin when the host sends
      // CORS headers (Supabase Storage and our sample host both do).
      const res = await fetch(pdfUrl);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: ask the storage layer to force a download via ?download=,
      // otherwise open in a new tab as a last resort.
      const sep = pdfUrl.includes('?') ? '&' : '?';
      window.location.href = `${pdfUrl}${sep}download=${encodeURIComponent(name)}`;
    }
  }

  function onDownload() {
    if (!pdfUrl) return;
    startTransition(async () => {
      await triggerDownload();
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
      {pending ? tc('loading') : t('downloadPdf')}
    </button>
  );
}
