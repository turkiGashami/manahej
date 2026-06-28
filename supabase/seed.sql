-- =============================================================================
-- Seed reference data (stages, subjects, languages).
-- Mirrors src/lib/taxonomy.ts — keep both in sync.
-- Idempotent: safe to run multiple times.
-- =============================================================================

insert into languages (code, name_ar, name_en, direction) values
  ('ar', 'العربية',  'Arabic',  'rtl'),
  ('en', 'الإنجليزية', 'English', 'ltr')
on conflict (code) do update
  set name_ar = excluded.name_ar,
      name_en = excluded.name_en,
      direction = excluded.direction;

insert into stages (slug, name_ar, name_en, sort_order) values
  ('primary',      'المرحلة الابتدائية', 'Primary',      1),
  ('intermediate', 'المرحلة المتوسطة',  'Intermediate', 2),
  ('secondary',    'المرحلة الثانوية',  'Secondary',    3),
  ('university',   'المرحلة الجامعية',  'University',    4),
  ('general',      'مستوى عام',         'General',       5)
on conflict (slug) do update
  set name_ar = excluded.name_ar,
      name_en = excluded.name_en,
      sort_order = excluded.sort_order;

insert into subjects (slug, name_ar, name_en, sort_order) values
  ('aqeedah',            'العقيدة',          'Aqeedah (Creed)',     1),
  ('tafsir',             'التفسير',          'Tafsir',              2),
  ('quran-sciences',     'علوم القرآن',      'Quranic Sciences',    3),
  ('hadith',             'الحديث',           'Hadith',              4),
  ('hadith-terminology', 'مصطلح الحديث',     'Hadith Terminology',  5),
  ('fiqh',               'الفقه',            'Fiqh',                6),
  ('usul-fiqh',          'أصول الفقه',       'Usul al-Fiqh',        7),
  ('seerah',             'السيرة النبوية',   'Seerah (Biography)',  8),
  ('tajweed',            'التجويد',          'Tajweed',             9),
  ('faraid',             'الفرائض',          'Faraid (Inheritance)', 10),
  ('nahw',               'النحو والصرف',     'Arabic Grammar',      11),
  ('akhlaq',             'الأخلاق والآداب',  'Ethics & Manners',    12)
on conflict (slug) do update
  set name_ar = excluded.name_ar,
      name_en = excluded.name_en,
      sort_order = excluded.sort_order;
