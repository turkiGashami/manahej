# منصة المناهج الشرعية — Manahej

منصة ويب مجانية متعددة اللغات (عربي/إنجليزي) لعرض المناهج الشرعية، كل منهج ملف PDF
واحد، منظّمة حسب **المرحلة ← المادة**، مع بحث وفلترة ومعاينة وتحميل — دون حساب للقارئ.

A free, multilingual (AR/EN) platform for Islamic curricula. Each curriculum is a
single PDF, organized by **stage → subject**, with search, filtering, in-browser
preview and download — no reader account required.

## Stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** with RTL/LTR via logical properties + `dir`
- **next-intl** for i18n (`/ar`, `/en`)
- **Supabase** (Postgres + Storage + Auth + RLS)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev                  # http://localhost:3000  → redirects to /ar
```

The app runs **without** Supabase configured: the stage/subject taxonomy renders
from `src/lib/taxonomy.ts`, and curricula lists show an empty state. Connect
Supabase to enable uploads, listings, search, downloads, and admin.

### Connecting Supabase

1. Create a Supabase project and copy the URL + anon (publishable) key and the
   service-role key into `.env.local`.
2. Apply the schema and seed (SQL editor, CLI, or MCP), in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_storage.sql`
   - `supabase/seed.sql`
3. Make yourself an admin (after signing up):
   ```sql
   update profiles set role = 'admin' where id = '<your-auth-user-id>';
   ```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Data model

See `supabase/migrations/0001_init.sql`. Highlights:

- `curricula` is the main table (one row = one PDF). `search_vector` (tsvector,
  `simple` config) + `pg_trgm` indexes power partial Arabic search over
  title/description/author.
- **RLS**: public reads only `status = 'published'`; owners manage their own
  drafts; admins publish/hide/remove and handle reports.
- `increment_download(uuid)` is a `SECURITY DEFINER` RPC so anonymous readers can
  bump the counter and log a row in `curriculum_downloads` (which powers the
  rolling "most downloaded last 30 days").

### Storage

`curricula` (PDFs) and `covers` are **public-read** buckets so published files get
stable public URLs. Trade-off: a draft's file is reachable by anyone who knows its
(UUID) path. For stricter privacy, make the `curricula` bucket private and serve
downloads via short-lived signed URLs.

## Roles & publishing flow

- **Reader** (no account): browse, search, preview, download, share, report.
- **Contributor** (signed in): `/upload` a PDF + cover + metadata → saved as
  `draft`. `page_count` and `file_size` are extracted automatically.
- **Admin**: `/admin` lists drafts, published, and open reports. Publish / hide /
  remove curricula, toggle editor picks, and resolve reports. Removal sets
  `status = 'removed'` (disappears from public view immediately).

Routes: `/[locale]`, `/browse`, `/stage/[slug]`, `/subject/[slug]`,
`/curriculum/[slug]`, `/search`, `/signin`, `/signup`, `/upload`, `/admin`.

## Project layout

```
src/
  app/[locale]/        # localized routes (layout sets lang/dir)
  components/          # Header, Footer, grids, theme/locale switchers, …
  i18n/                # next-intl routing, navigation, request config
  lib/                 # taxonomy, supabase clients, utils
  types/               # database types
messages/              # ar.json, en.json
supabase/              # migrations + seed
docs/                  # the build brief
```

## Notes

- The project currently lives under iCloud Drive. `node_modules` will be synced by
  iCloud (slow/noisy). Consider moving the project outside iCloud or excluding it.
