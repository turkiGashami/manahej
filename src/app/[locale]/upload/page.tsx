import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { UploadForm } from '@/components/UploadForm';
import { getAuthContext } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';

// Auth-gated and writes data — always rendered per-request.
export const dynamic = 'force-dynamic';

export default async function UploadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('upload');

  // When Supabase is configured, require an authenticated contributor.
  if (isSupabaseConfigured) {
    const ctx = await getAuthContext();
    if (!ctx) redirect(`/${locale}/signin`);
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
        <UploadForm />
      </div>
    </div>
  );
}
