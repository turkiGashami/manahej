'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const t = useTranslations('common');
  const router = useRouter();
  const [value, setValue] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('search')}
        className="w-full rounded-lg border border-border bg-surface py-2 ps-10 pe-3 text-sm
                   placeholder:text-muted focus-visible:border-primary focus-visible:outline-none"
      />
    </form>
  );
}
