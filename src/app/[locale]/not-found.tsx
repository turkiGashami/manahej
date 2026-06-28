import { Link } from '@/i18n/navigation';

// Rendered for notFound() within a locale route. Kept locale-agnostic
// (bilingual) since notFound boundaries don't receive route params.
export default function LocaleNotFound() {
  return (
    <div className="container-page grid place-items-center py-24 text-center">
      <div className="space-y-3">
        <p className="text-5xl font-bold text-primary">٤٠٤</p>
        <h1 className="text-xl font-semibold">الصفحة غير موجودة · Page not found</h1>
        <p className="text-muted">
          عذراً، لم نعثر على ما تبحث عنه. · Sorry, we couldn’t find that.
        </p>
        <Link href="/" className="btn-primary mt-2">
          الرئيسية · Home
        </Link>
      </div>
    </div>
  );
}
