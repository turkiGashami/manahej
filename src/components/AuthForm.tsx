'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { signInAction, signUpAction, type AuthState } from '@/app/auth-actions';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const action = mode === 'signin' ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  const errorText = state.error ? errorMessage(state.error, locale) : null;

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <input type="hidden" name="locale" value={locale} />

      {mode === 'signup' ? (
        <Field label={t('displayName')}>
          <input
            name="displayName"
            type="text"
            autoComplete="name"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2"
          />
        </Field>
      ) : null}

      <Field label={t('email')}>
        <input
          name="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2"
        />
      </Field>

      <Field label={t('password')}>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          dir="ltr"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2"
        />
      </Field>

      {errorText ? (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {errorText}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {mode === 'signin' ? t('signIn') : t('signUp')}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === 'signin' ? (
          <Link href="/signup" className="text-primary hover:underline">
            {t('signUp')}
          </Link>
        ) : (
          <Link href="/signin" className="text-primary hover:underline">
            {t('signIn')}
          </Link>
        )}
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}

function errorMessage(code: string, locale: string): string {
  const ar = locale === 'ar';
  switch (code) {
    case 'not-configured':
      return ar ? 'الخدمة غير مهيّأة بعد.' : 'Service is not configured yet.';
    case 'invalid':
      return ar ? 'بيانات غير صحيحة.' : 'Invalid credentials.';
    case 'weak':
      return ar ? 'كلمة المرور قصيرة (6 أحرف على الأقل).' : 'Password too short (min 6).';
    default:
      return code;
  }
}
