import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SearchBar } from './SearchBar';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { AuthMenu } from './AuthMenu';

export async function Header() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
          <LogoMark />
          <span className="hidden font-display text-lg sm:inline">{t('common.siteName')}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="primary">
          <NavLink href="/browse">{t('nav.browse')}</NavLink>
          <NavLink href="/ask">
            <span className="inline-flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3l1.8 4.9L18.7 9l-4.9 1.8L12 15.7l-1.8-4.9L5.3 9l4.9-1.1L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {t('nav.ask')}
            </span>
          </NavLink>
        </nav>

        <div className="mx-auto hidden w-full max-w-md lg:block">
          <SearchBar />
        </div>

        <div className="ms-auto flex items-center gap-2">
          <AuthMenu />
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Compact search row for small screens. */}
      <div className="container-page pb-3 lg:hidden">
        <SearchBar />
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </Link>
  );
}

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-fg"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5V5.5ZM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5V5.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
