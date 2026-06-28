# Build Brief — منصة المناهج الشرعية
### وثيقة تنفيذية لـ Claude Code

> الهدف: بناء منصة ويب مجانية متعددة اللغات تعرض **مناهج شرعية**، كل منهج **ملف PDF واحد**، منظّمة حسب
> **المرحلة ← المادة**، مع بحث وفلترة وعرض داخل المتصفح وتحميل — دون حساب للقارئ.
> *(لا حوكمة ولا اعتماد ولا أدوات تعليمية منفصلة — خارج النطاق.)*

---

## 1. نطاق الإصدار الأول (MVP)

**داخل النطاق:** تصفّح حسب المرحلة/المادة · بحث وفلترة بعدّادات · صفحة منهج بمعاينة PDF وتحميل · مشاركة برابط/QR · مناهج ذات صلة · صفحات اكتشاف (الأحدث/الأكثر تحميلاً/مختارات) · رفع من جهة مساهِمة · لوحة إدارة بسيطة · تعدد اللغات (AR/EN) مع RTL/LTR · وضع ليلي · إتاحة وصول · بلاغ/إزالة.

**خارج النطاق:** حساب للقارئ · حوكمة/اعتماد/لجان · أدوات معلم/خطط/أنشطة/تقويم · دفع · تعليقات/تقييمات.

---

## 2. المستخدمون والأدوار

| الدور | المصادقة | الصلاحيات |
|---|---|---|
| القارئ | بدون حساب | تصفّح · بحث · قراءة · تحميل · مشاركة · بلاغ |
| الجهة المساهِمة (`contributor`) | حساب | رفع منهج (PDF + بيانات) → يبدأ كـ `draft` |
| الإدارة (`admin`) | حساب | نشر/إخفاء المناهج · إدارة التصنيفات · معالجة البلاغات |

---

## 3. التقنيات المقترحة (قابلة للتبديل)

- **الإطار:** Next.js (App Router) + TypeScript.
- **التنسيق:** Tailwind CSS + دعم RTL/LTR.
- **التدويل:** `next-intl` بمسارات `/[locale]` (ar, en).
- **قاعدة البيانات + التخزين + المصادقة:** Supabase (Postgres + Storage لملفات الـ PDF والأغلفة + Auth للمساهمين/الإدارة + RLS).
- **معاينة PDF:** `react-pdf` / `pdf.js` (عرض أول صفحات داخل المتصفح).
- **البحث:** Postgres `tsvector` + `pg_trgm` للبحث الجزئي بالعربية على العنوان/الوصف/المؤلف.
- **QR:** توليد رمز من رابط المنهج (`qrcode` على الخادم أو العميل).
- **الاستضافة:** Vercel (الواجهة) + Supabase (الخلفية).

---

## 4. نموذج البيانات (Schema)

جداول مرجعية:

```
stages(id, slug, name_ar, name_en, sort_order)
subjects(id, slug, name_ar, name_en, sort_order)
languages(id, code, name_ar, name_en, direction)   -- direction: 'rtl' | 'ltr'
contributors(id, name_ar, name_en, type, user_id?)  -- type: author | publisher | center
profiles(id -> auth.users, role, display_name)       -- role: contributor | admin
```

الجدول الرئيسي:

```
curricula(
  id              uuid pk,
  slug            text unique,
  title_ar        text,
  title_en        text?,
  description     text,
  cover_url       text,            -- Storage
  pdf_url         text,            -- Storage
  page_count      int,
  file_size       bigint,
  stage_id        fk -> stages,
  subject_id      fk -> subjects,
  grade           text?,           -- الصف (اختياري حسب المرحلة)
  language_id     fk -> languages,
  contributor_id  fk -> contributors,
  version         text default '1.0',
  status          text,            -- draft | published | removed
  is_editor_pick  bool default false,
  download_count  int default 0,
  created_at      timestamptz,
  updated_at      timestamptz,
  search_vector   tsvector         -- مولّد من العنوان/الوصف/المؤلف
)
```

التحميلات والبلاغات:

```
curriculum_downloads(id, curriculum_id fk, created_at)   -- صف لكل تحميل (يدعم "الأكثر تحميلاً آخر 30 يوم")
reports(id, curriculum_id fk, reason, message, reporter_email?, status, created_at)  -- status: open | reviewed | actioned
```

ملاحظات:
- كل منهج له **مرحلة واحدة + مادة واحدة + لغة واحدة** (لأنه ملف PDF واحد). إن لزم وسوم متقاطعة لاحقاً: جدول `tags` + `curriculum_tags`.
- `download_count` عدّاد سريع للعرض، و`curriculum_downloads` للسجل الزمني والترتيب المتجدّد.
- فعّل RLS: القراءة العامة على `status='published'` فقط؛ الكتابة للمالك/الإدارة.

---

## 5. المسارات (Routes)

```
/[locale]                         الصفحة الرئيسية (مدخلان + بحث + صفوف اكتشاف)
/[locale]/browse                  كل المناهج + فلاتر (query params)
/[locale]/stage/[stageSlug]       تصفّح حسب المرحلة
/[locale]/subject/[subjectSlug]   تصفّح حسب المادة
/[locale]/curriculum/[slug]       صفحة المنهج (تفاصيل + معاينة + تحميل + QR + ذات صلة)
/[locale]/search?q=               نتائج البحث
/[locale]/upload                  رفع منهج (يتطلب دور contributor)
/[locale]/admin                   لوحة الإدارة (يتطلب دور admin)
```

**باراميترات الفلترة على `/browse`:** `stage, subject, lang, contributor, grade, sort, q, page`
(تُعرض في الرابط لتكون قابلة للمشاركة والفهرسة). `sort ∈ {newest, most_downloaded}`.

API / Server Actions: `incrementDownload(curriculumId)` · `submitReport(...)` · `uploadCurriculum(...)` · `publishCurriculum(id)`.

---

## 6. المكوّنات (Components)

`Header` (تنقّل + بحث + مبدّل لغة + زر وضع ليلي) · `FilterSidebar` (فاسِت لكل بُعد مع **عدّاد** بجانب كل خيار، متعدد الاختيار) · `SortBar` · `CurriculumCard` · `CurriculumGrid` · `Pagination` · `PdfPreview` · `DownloadButton` (يزيد العدّاد) · `QrShare` · `DiscoveryRow` (كاروسيل) · `RelatedCurricula` · `ReportDialog` · `StageGrid` / `SubjectGrid` · `ThemeToggle` · `LocaleSwitcher`.

**بطاقة المنهج (`CurriculumCard`):** غلاف · عنوان · جهة/مؤلف · مرحلة · مادة · وسم لغة · عدد صفحات · رابط التفاصيل.

**صفحة المنهج:** الغلاف · العنوان · الجهة/المؤلف · المرحلة · المادة · الصف · اللغة · عدد الصفحات · النسخة · تاريخ الإضافة · نبذة · **معاينة PDF** · زر تحميل · مشاركة (رابط + QR) · **مناهج ذات صلة** (بنفس المرحلة/المادة).

---

## 7. منطق الفلترة والعدّادات

- الفلاتر **faceted**: عند اختيار قيمة في بُعد، تتحدّث عدّادات بقية الأبعاد بناءً على النتيجة الحالية.
- العدّاد لكل خيار = `COUNT(*)` على `curricula` حيث `status='published'` ومطابق للفلاتر النشطة الأخرى.
- **إخفاء الخيارات ذات العدّاد صفر**، وتوحيد أسماء الجهات لتفادي التكرار.
- الترتيب: `newest` = `created_at desc` ؛ `most_downloaded` = تجميع `curriculum_downloads` خلال آخر 30 يوماً (rolling) لإبقاء القائمة متجددة.

---

## 8. الرفع والنشر (بدون اعتماد)

1. الجهة المساهِمة تسجّل الدخول → `/upload` → ترفع PDF + الغلاف + البيانات الوصفية.
2. يُحفظ كـ `status = draft`.
3. الإدارة تستعرض المسودّات في `/admin` وتضغط **نشر** → `status = published` (أو إخفاء). *(تحقّق شكلي فقط: اكتمال البيانات وصحة الملف — لا لجان ولا اعتماد.)*
4. تستخرج `page_count` و`file_size` تلقائياً من الـ PDF عند الرفع.

---

## 9. تعدد اللغات والإتاحة

- واجهة AR/EN عبر `next-intl`؛ ضبط `dir` تلقائياً حسب اللغة (RTL/LTR).
- كل منهج موسوم بلغته؛ فلتر اللغة مدعوم بعدّاد.
- وضع ليلي (Tailwind `dark`)؛ التزام أساسيات WCAG (تباين، تنقّل لوحة مفاتيح، نصوص بديلة للأغلفة).

---

## 10. الحقوق والإزالة

- زر **«الإبلاغ عن محتوى»** في صفحة المنهج → ينشئ صفاً في `reports`.
- الإدارة تعالج البلاغ في `/admin`؛ الإزالة = `status='removed'` (يختفي من العرض العام فوراً).

---

## 11. اعتبارات

- **الأداء:** فهارس على `stage_id, subject_id, language_id, status, created_at` + GIN على `search_vector`. صفحات قائمة مع pagination.
- **التخزين:** PDF/أغلفة في Supabase Storage بروابط عامة للمنشور.
- **SEO:** روابط منهج ثابتة (slug)، بيانات وصفية، sitemap — لأن الانتشار يعتمد على الروابط المباشرة.
- **الأمان:** RLS صارمة؛ القراءة العامة للمنشور فقط؛ الرفع للمالك؛ النشر/الحذف للإدارة.

---

## 12. قرارات مفتوحة للتأكيد قبل البدء

1. **التقنيات:** أعتمد Next.js + Supabase المقترحة؟ أم لديك ستاك مفضّل (Laravel، Django، …)؟
2. **مصادقة المساهمين:** بريد/كلمة مرور فقط، أم مزوّدات خارجية (Google)؟
3. **النشر:** هل يبقى الرفع كمسودّة بانتظار نشر الإدارة (المقترح)، أم نشر مباشر للجهات الموثوقة؟
4. **القوائم الأولية:** قائمة المراحل والمواد ثابتة كما في الوصف، أم تضيف/تعدّل؟
