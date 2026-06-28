'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { uploadCurriculum, type UploadState } from '@/app/upload-actions';
import { STAGES, SUBJECTS, LANGUAGES, localizedName } from '@/lib/taxonomy';

export function UploadForm() {
  const t = useTranslations('upload');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    uploadCurriculum,
    { ok: false },
  );

  if (state.ok) {
    return (
      <div className="card space-y-4 p-6 text-center">
        <p className="text-lg font-semibold text-primary">✓</p>
        <p>{t('draftNote')}</p>
        <div className="flex justify-center gap-2">
          <Link href="/" className="btn-ghost">
            {tc('browseAll')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${tc('search')} — العنوان (عربي) *`} full>
          <input name="title_ar" required className={inputCls} />
        </Field>
        <Field label="Title (English)">
          <input name="title_en" dir="ltr" className={inputCls} />
        </Field>
      </div>

      <Field label={tc('viewDetails')}>
        <textarea name="description" rows={3} className={inputCls} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`${tc('stage')} *`}>
          <select name="stage" required defaultValue="" className={inputCls}>
            <option value="" disabled>
              —
            </option>
            {STAGES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {localizedName(s, locale)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`${tc('subject')} *`}>
          <select name="subject" required defaultValue="" className={inputCls}>
            <option value="" disabled>
              —
            </option>
            {SUBJECTS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {localizedName(s, locale)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`${tc('language')} *`}>
          <select name="lang" required defaultValue="ar" className={inputCls}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {localizedName(l, locale)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={tc('grade')}>
          <input name="grade" className={inputCls} />
        </Field>
        <Field label={tc('version')}>
          <input name="version" defaultValue="1.0" dir="ltr" className={inputCls} />
        </Field>
        <Field label={`${tc('contributor')} *`}>
          <input name="contributor_name" required className={inputCls} />
        </Field>
      </div>

      <Field label={tc('contributor')}>
        <select name="contributor_type" defaultValue="author" className={inputCls}>
          <option value="author">{locale === 'ar' ? 'مؤلف' : 'Author'}</option>
          <option value="publisher">{locale === 'ar' ? 'ناشر' : 'Publisher'}</option>
          <option value="center">{locale === 'ar' ? 'مركز' : 'Center'}</option>
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t('pdfFile')} *`}>
          <input name="pdf" type="file" accept="application/pdf,.pdf" required className={fileCls} />
        </Field>
        <Field label={t('coverImage')}>
          <input name="cover" type="file" accept="image/*" className={fileCls} />
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {uploadError(state.error, locale)}
        </p>
      ) : null}

      <p className="text-sm text-muted">{t('draftNote')}</p>

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? tc('loading') : t('submit')}
      </button>
    </form>
  );
}

const inputCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2';
const fileCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm file:me-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1';

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block text-sm ${full ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}

function uploadError(code: string, locale: string): string {
  const ar = locale === 'ar';
  const map: Record<string, [string, string]> = {
    'not-configured': ['الخدمة غير مهيّأة بعد.', 'Service not configured.'],
    unauthorized: ['يلزم تسجيل الدخول.', 'You must sign in.'],
    'missing-fields': ['أكمل الحقول المطلوبة.', 'Fill the required fields.'],
    'missing-pdf': ['ملف PDF مطلوب.', 'A PDF file is required.'],
    'not-pdf': ['الملف ليس PDF.', 'File is not a PDF.'],
    'bad-taxonomy': ['تصنيف غير صالح.', 'Invalid taxonomy.'],
    'contributor-failed': ['تعذّر حفظ الجهة.', 'Could not save contributor.'],
    'pdf-upload-failed': ['تعذّر رفع الملف.', 'PDF upload failed.'],
    'insert-failed': ['تعذّر الحفظ.', 'Could not save.'],
  };
  const pair = map[code];
  return pair ? (ar ? pair[0] : pair[1]) : code;
}
