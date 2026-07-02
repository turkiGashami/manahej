'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { askLibraryAction } from '@/app/ai-actions';
import { CurriculumCard } from './CurriculumCard';
import type { AskResult } from '@/lib/ai';

export function AskLibrary({ examples }: { examples: string[] }) {
  const t = useTranslations('ask');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [q, setQ] = useState('');
  const [pending, startTransition] = useTransition();
  const [res, setRes] = useState<AskResult | null>(null);

  function ask(question: string) {
    const text = question.trim();
    if (!text || pending) return;
    setQ(text);
    startTransition(async () => {
      setRes(await askLibraryAction(text, locale));
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="space-y-3"
      >
        <div className="relative">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                ask(q);
              }
            }}
            rows={2}
            placeholder={t('placeholder')}
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-base
                       placeholder:text-muted focus-visible:border-primary focus-visible:outline-none"
          />
        </div>
        <button type="submit" disabled={pending || !q.trim()} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
          <SparkIcon />
          {pending ? tc('loading') : t('askButton')}
        </button>
      </form>

      {/* Example prompts */}
      {!res && !pending ? (
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => ask(ex)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-fg"
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}

      {/* Result */}
      {res ? (
        !res.configured ? (
          <p className="card p-4 text-sm text-muted">{t('notConfigured')}</p>
        ) : (
          <div className="space-y-5">
            {res.answer ? (
              <div className={res.refused ? 'card border-accent/40 p-4' : 'card p-4'}>
                <p className="whitespace-pre-line leading-relaxed">{res.answer}</p>
              </div>
            ) : null}

            {res.items.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {res.items.map((c) => (
                  <CurriculumCard key={c.id} curriculum={c} locale={locale} />
                ))}
              </div>
            ) : res.ok && !res.answer ? (
              <p className="text-muted">{tc('noResults')}</p>
            ) : null}

            <p className="text-xs text-muted">{t('disclaimer')}</p>
          </div>
        )
      ) : null}
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.8 4.9L18.7 9l-4.9 1.8L12 15.7l-1.8-4.9L5.3 9l4.9-1.1L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M18.5 14.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
