'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function QrShare({ url }: { url: string }) {
  const t = useTranslations('curriculum');
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    // Lazy-load qrcode so it stays out of the initial bundle.
    import('qrcode')
      .then((mod) => mod.toDataURL(url, { margin: 1, width: 240 }))
      .then((dataUrl) => {
        if (active) setQr(dataUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <p className="text-sm font-medium text-muted">{t('qrCode')}</p>
      <div className="flex items-center gap-4">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-lg border border-border bg-white p-1">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={t('qrCode')} width={104} height={104} />
          ) : (
            <span className="text-xs text-muted">…</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-xs text-muted" dir="ltr">
            {url}
          </p>
          <button type="button" onClick={copyLink} className="btn-ghost w-full">
            {copied ? t('linkCopied') : t('shareLink')}
          </button>
        </div>
      </div>
    </div>
  );
}
