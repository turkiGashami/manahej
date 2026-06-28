'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { submitReport } from '@/app/actions';

const REASONS = [
  { value: 'copyright', key: 'reasonCopyright' },
  { value: 'inappropriate', key: 'reasonInappropriate' },
  { value: 'broken_file', key: 'reasonBrokenFile' },
  { value: 'other', key: 'reasonOther' },
] as const;

export function ReportDialog({ curriculumId }: { curriculumId: string }) {
  const t = useTranslations('report');
  const tc = useTranslations('common');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function open() {
    setDone(false);
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitReport({
        curriculumId,
        reason: String(form.get('reason') || 'other'),
        message: String(form.get('message') || ''),
        email: String(form.get('email') || ''),
      });
      if (res.ok) setDone(true);
    });
  }

  return (
    <>
      <button type="button" onClick={open} className="text-sm text-muted hover:text-fg">
        <span className="inline-flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {tc('report')}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(92vw,28rem)] rounded-xl border border-border bg-surface p-0 text-fg backdrop:bg-black/40"
      >
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('title')}</h2>
            <button type="button" onClick={close} aria-label={t('cancel')} className="text-muted hover:text-fg">
              ✕
            </button>
          </div>

          {done ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">{t('submitted')}</p>
              <button type="button" onClick={close} className="btn-primary w-full">
                {t('cancel')}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-muted">{t('reason')}</span>
                <select
                  name="reason"
                  defaultValue="copyright"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {t(r.key)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-muted">{t('message')}</span>
                <textarea
                  name="message"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-muted">{t('email')}</span>
                <input
                  name="email"
                  type="email"
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2"
                />
              </label>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={pending} className="btn-primary flex-1 disabled:opacity-60">
                  {t('submit')}
                </button>
                <button type="button" onClick={close} className="btn-ghost">
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
