import { Link } from '@/i18n/navigation';

type Params = Record<string, string | string[] | undefined>;

function hrefFor(basePath: string, params: Params, page: number): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'page' || value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => sp.append(key, v));
    else sp.append(key, value);
  }
  if (page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Compact page list with first/last and an ellipsis window. */
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Params;
}) {
  if (pageCount <= 1) return null;
  const items = pageWindow(page, pageCount);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="pagination">
      <PageLink
        href={hrefFor(basePath, params, Math.max(1, page - 1))}
        disabled={page <= 1}
        label="‹"
      />
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`e${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={hrefFor(basePath, params, it)}
            aria-current={it === page ? 'page' : undefined}
            className={
              it === page
                ? 'grid h-9 min-w-9 place-items-center rounded-lg bg-primary px-2 font-medium text-primary-fg'
                : 'grid h-9 min-w-9 place-items-center rounded-lg border border-border px-2 hover:bg-surface-2'
            }
          >
            {it}
          </Link>
        ),
      )}
      <PageLink
        href={hrefFor(basePath, params, Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        label="›"
      />
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="grid h-9 min-w-9 place-items-center rounded-lg border border-border px-2 text-muted opacity-50">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="grid h-9 min-w-9 place-items-center rounded-lg border border-border px-2 hover:bg-surface-2"
    >
      {label}
    </Link>
  );
}
