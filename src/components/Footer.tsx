import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-fg">{t('common.siteName')}</span>
          {' — '}
          {t('footer.rights')}
        </p>
        <nav className="flex items-center gap-4" aria-label="footer">
          <Link href="/browse" className="hover:text-fg">
            {t('nav.browse')}
          </Link>
          <Link href="/upload" className="hover:text-fg">
            {t('nav.upload')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
