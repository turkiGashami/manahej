import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AuthForm } from '@/components/AuthForm';

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="container-page grid place-items-center py-16">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold">{t('signUp')}</h1>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
