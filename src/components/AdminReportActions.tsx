'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { setReportStatus } from '@/app/admin-actions';
import type { ReportStatus } from '@/types/database';

export function AdminReportActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(status: ReportStatus) {
    startTransition(async () => {
      await setReportStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className={pending ? 'flex gap-2 opacity-60' : 'flex gap-2'}>
      <button
        type="button"
        onClick={() => set('reviewed')}
        className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface-2"
      >
        reviewed
      </button>
      <button
        type="button"
        onClick={() => set('actioned')}
        className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-fg"
      >
        actioned
      </button>
    </div>
  );
}
