'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { setCurriculumStatus, setEditorPick } from '@/app/admin-actions';
import type { CurriculumStatus } from '@/types/database';
import { cn } from '@/lib/utils';

export function AdminCurriculumActions({
  id,
  status,
  isEditorPick,
}: {
  id: string;
  status: CurriculumStatus;
  isEditorPick: boolean;
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', pending && 'opacity-60')}>
      {status !== 'published' ? (
        <button
          type="button"
          onClick={() => run(() => setCurriculumStatus(id, 'published'))}
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-fg"
        >
          {t('publish')}
        </button>
      ) : null}

      {status === 'published' ? (
        <>
          <button
            type="button"
            onClick={() => run(() => setCurriculumStatus(id, 'draft'))}
            className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface-2"
          >
            {t('hide')}
          </button>
          <button
            type="button"
            onClick={() => run(() => setEditorPick(id, !isEditorPick))}
            aria-pressed={isEditorPick}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs',
              isEditorPick
                ? 'bg-accent/20 text-accent'
                : 'border border-border hover:bg-surface-2',
            )}
          >
            ★
          </button>
        </>
      ) : null}

      {status !== 'removed' ? (
        <button
          type="button"
          onClick={() => run(() => setCurriculumStatus(id, 'removed'))}
          className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-600 hover:bg-red-500/10 dark:text-red-400"
        >
          {t('remove')}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => run(() => setCurriculumStatus(id, 'draft'))}
          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface-2"
        >
          ↩
        </button>
      )}
    </div>
  );
}
