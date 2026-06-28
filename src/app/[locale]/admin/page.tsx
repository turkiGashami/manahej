import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AdminCurriculumActions } from '@/components/AdminCurriculumActions';
import { AdminReportActions } from '@/components/AdminReportActions';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAuthContext, isAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { localizedTitle, formatDate, formatNumber } from '@/lib/utils';
import type { CurriculumStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

type AdminRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  status: CurriculumStatus;
  is_editor_pick: boolean;
  created_at: string;
  download_count: number;
  contributor: { name_ar: string; name_en: string | null } | null;
};

type ReportRow = {
  id: string;
  reason: string;
  message: string | null;
  reporter_email: string | null;
  status: string;
  created_at: string;
  curriculum: { slug: string; title_ar: string; title_en: string | null } | null;
};

const ROW_SELECT =
  'id,slug,title_ar,title_en,status,is_editor_pick,created_at,download_count,contributor:contributors(name_ar,name_en)';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  if (!isSupabaseConfigured) {
    return (
      <div className="container-page py-16 text-center text-muted">
        <h1 className="mb-2 text-2xl font-bold text-fg">{t('title')}</h1>
        <p>Connect Supabase to use the admin dashboard.</p>
      </div>
    );
  }

  const ctx = await getAuthContext();
  if (!ctx) redirect(`/${locale}/signin`);
  if (!isAdmin(ctx)) redirect(`/${locale}`);

  const supabase = (await getSupabaseServerClient())!;
  const [draftsRes, publishedRes, reportsRes] = await Promise.all([
    supabase.from('curricula').select(ROW_SELECT).eq('status', 'draft').order('created_at', { ascending: false }),
    supabase.from('curricula').select(ROW_SELECT).eq('status', 'published').order('created_at', { ascending: false }).limit(50),
    supabase
      .from('reports')
      .select('id,reason,message,reporter_email,status,created_at,curriculum:curricula(slug,title_ar,title_en)')
      .neq('status', 'actioned')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const drafts = (draftsRes.data ?? []) as unknown as AdminRow[];
  const published = (publishedRes.data ?? []) as unknown as AdminRow[];
  const reports = (reportsRes.data ?? []) as unknown as ReportRow[];

  return (
    <div className="container-page space-y-10 py-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Section title={`${t('drafts')} (${formatNumber(drafts.length, locale)})`}>
        <CurriculaTable rows={drafts} locale={locale} />
      </Section>

      <Section title={`${t('reports')} (${formatNumber(reports.length, locale)})`}>
        {reports.length === 0 ? (
          <Empty />
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    <span className="chip me-2">{r.reason}</span>
                    {r.curriculum ? (
                      <Link href={`/curriculum/${r.curriculum.slug}`} className="hover:underline">
                        {localizedTitle(r.curriculum, locale)}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </p>
                  {r.message ? <p className="text-sm text-muted">{r.message}</p> : null}
                  <p className="text-xs text-muted">
                    {r.reporter_email || '—'} · {formatDate(r.created_at, locale)} · {r.status}
                  </p>
                </div>
                <AdminReportActions id={r.id} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`${t('published')} (${formatNumber(published.length, locale)})`}>
        <CurriculaTable rows={published} locale={locale} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="card p-6 text-center text-sm text-muted">—</p>;
}

function CurriculaTable({ rows, locale }: { rows: AdminRow[]; locale: string }) {
  if (rows.length === 0) return <Empty />;
  return (
    <ul className="space-y-2">
      {rows.map((c) => (
        <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <Link href={`/curriculum/${c.slug}`} className="font-medium hover:underline">
              {localizedTitle(c, locale)}
            </Link>
            <p className="text-xs text-muted">
              {c.contributor?.name_ar || '—'} · {formatDate(c.created_at, locale)} ·{' '}
              {formatNumber(c.download_count, locale)}↓
            </p>
          </div>
          <AdminCurriculumActions id={c.id} status={c.status} isEditorPick={c.is_editor_pick} />
        </li>
      ))}
    </ul>
  );
}
