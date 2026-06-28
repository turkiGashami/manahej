/**
 * Canonical reference taxonomy (stages, subjects, languages).
 *
 * This is the single source of truth for the fixed lists the brief describes.
 * The UI renders from here so the site works even before a database is
 * connected, and `supabase/seed.sql` seeds the same values into the DB.
 * Keep this file and the seed in sync.
 */

export type TaxonomyItem = {
  slug: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
};

export type LanguageItem = {
  code: string;
  name_ar: string;
  name_en: string;
  direction: 'rtl' | 'ltr';
};

export const STAGES: TaxonomyItem[] = [
  { slug: 'primary', name_ar: 'المرحلة الابتدائية', name_en: 'Primary', sort_order: 1 },
  { slug: 'intermediate', name_ar: 'المرحلة المتوسطة', name_en: 'Intermediate', sort_order: 2 },
  { slug: 'secondary', name_ar: 'المرحلة الثانوية', name_en: 'Secondary', sort_order: 3 },
  { slug: 'university', name_ar: 'المرحلة الجامعية', name_en: 'University', sort_order: 4 },
  { slug: 'general', name_ar: 'مستوى عام', name_en: 'General', sort_order: 5 },
];

export const SUBJECTS: TaxonomyItem[] = [
  { slug: 'aqeedah', name_ar: 'العقيدة', name_en: 'Aqeedah (Creed)', sort_order: 1 },
  { slug: 'tafsir', name_ar: 'التفسير', name_en: 'Tafsir', sort_order: 2 },
  { slug: 'quran-sciences', name_ar: 'علوم القرآن', name_en: 'Quranic Sciences', sort_order: 3 },
  { slug: 'hadith', name_ar: 'الحديث', name_en: 'Hadith', sort_order: 4 },
  { slug: 'hadith-terminology', name_ar: 'مصطلح الحديث', name_en: 'Hadith Terminology', sort_order: 5 },
  { slug: 'fiqh', name_ar: 'الفقه', name_en: 'Fiqh', sort_order: 6 },
  { slug: 'usul-fiqh', name_ar: 'أصول الفقه', name_en: 'Usul al-Fiqh', sort_order: 7 },
  { slug: 'seerah', name_ar: 'السيرة النبوية', name_en: 'Seerah (Biography)', sort_order: 8 },
  { slug: 'tajweed', name_ar: 'التجويد', name_en: 'Tajweed', sort_order: 9 },
  { slug: 'faraid', name_ar: 'الفرائض', name_en: 'Faraid (Inheritance)', sort_order: 10 },
  { slug: 'nahw', name_ar: 'النحو والصرف', name_en: 'Arabic Grammar', sort_order: 11 },
  { slug: 'akhlaq', name_ar: 'الأخلاق والآداب', name_en: 'Ethics & Manners', sort_order: 12 },
];

export const LANGUAGES: LanguageItem[] = [
  { code: 'ar', name_ar: 'العربية', name_en: 'Arabic', direction: 'rtl' },
  { code: 'en', name_ar: 'الإنجليزية', name_en: 'English', direction: 'ltr' },
];

export function stageBySlug(slug: string): TaxonomyItem | undefined {
  return STAGES.find((s) => s.slug === slug);
}

export function subjectBySlug(slug: string): TaxonomyItem | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

/** Localized name helper for any taxonomy item. */
export function localizedName(
  item: { name_ar: string; name_en: string },
  locale: string,
): string {
  return locale === 'ar' ? item.name_ar : item.name_en;
}
