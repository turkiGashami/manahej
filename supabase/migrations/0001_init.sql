-- =============================================================================
-- Manahej — initial schema, search, RLS, and helper functions.
-- Target: Supabase (Postgres). Apply via Supabase SQL editor, CLI, or MCP.
-- =============================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;     -- trigram partial search (Arabic)

-- -----------------------------------------------------------------------------
-- Reference tables
-- -----------------------------------------------------------------------------
create table if not exists stages (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name_ar    text not null,
  name_en    text not null,
  sort_order int  not null default 0
);

create table if not exists subjects (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name_ar    text not null,
  name_en    text not null,
  sort_order int  not null default 0
);

create table if not exists languages (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  name_ar    text not null,
  name_en    text not null,
  direction  text not null default 'rtl' check (direction in ('rtl', 'ltr'))
);

create table if not exists contributors (
  id       uuid primary key default gen_random_uuid(),
  name_ar  text not null,
  name_en  text,
  type     text not null default 'author' check (type in ('author', 'publisher', 'center')),
  user_id  uuid references auth.users (id) on delete set null
);

-- One profile per auth user. Role drives authorization.
create table if not exists profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'contributor' check (role in ('contributor', 'admin')),
  display_name text
);

-- -----------------------------------------------------------------------------
-- Main table: curricula (each row = one PDF)
-- -----------------------------------------------------------------------------
create table if not exists curricula (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title_ar       text not null,
  title_en       text,
  description    text,
  cover_url      text,
  pdf_url        text,
  page_count     int,
  file_size      bigint,
  stage_id       uuid not null references stages (id),
  subject_id     uuid not null references subjects (id),
  grade          text,
  language_id    uuid not null references languages (id),
  contributor_id uuid not null references contributors (id),
  created_by     uuid references auth.users (id) on delete set null,  -- ownership for RLS
  version        text not null default '1.0',
  status         text not null default 'draft' check (status in ('draft', 'published', 'removed')),
  is_editor_pick boolean not null default false,
  download_count int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  search_vector  tsvector
);

-- Time-series download log (powers rolling "most downloaded last 30 days").
create table if not exists curriculum_downloads (
  id            uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references curricula (id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table if not exists reports (
  id             uuid primary key default gen_random_uuid(),
  curriculum_id  uuid not null references curricula (id) on delete cascade,
  reason         text not null,
  message        text,
  reporter_email text,
  status         text not null default 'open' check (status in ('open', 'reviewed', 'actioned')),
  created_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists curricula_stage_idx       on curricula (stage_id);
create index if not exists curricula_subject_idx     on curricula (subject_id);
create index if not exists curricula_language_idx    on curricula (language_id);
create index if not exists curricula_contributor_idx on curricula (contributor_id);
create index if not exists curricula_status_idx      on curricula (status);
create index if not exists curricula_created_at_idx  on curricula (created_at desc);
create index if not exists curricula_search_idx      on curricula using gin (search_vector);
create index if not exists curricula_title_ar_trgm   on curricula using gin (title_ar gin_trgm_ops);
create index if not exists curricula_title_en_trgm   on curricula using gin (title_en gin_trgm_ops);
create index if not exists downloads_curr_time_idx   on curriculum_downloads (curriculum_id, created_at desc);
create index if not exists reports_status_idx        on reports (status, created_at desc);

-- -----------------------------------------------------------------------------
-- Triggers: updated_at + search_vector
-- -----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists curricula_set_updated_at on curricula;
create trigger curricula_set_updated_at
  before update on curricula
  for each row execute function set_updated_at();

-- Build search_vector from titles, description, and the contributor's name.
-- 'simple' config + the trigram indexes above cover partial Arabic search.
create or replace function curricula_build_search_vector() returns trigger
language plpgsql as $$
declare
  c_ar text;
  c_en text;
begin
  select name_ar, coalesce(name_en, '')
    into c_ar, c_en
    from contributors
    where id = new.contributor_id;

  new.search_vector := to_tsvector(
    'simple',
    coalesce(new.title_ar, '') || ' ' ||
    coalesce(new.title_en, '') || ' ' ||
    coalesce(new.description, '') || ' ' ||
    coalesce(c_ar, '') || ' ' ||
    coalesce(c_en, '')
  );
  return new;
end;
$$;

drop trigger if exists curricula_search_vector on curricula;
create trigger curricula_search_vector
  before insert or update of title_ar, title_en, description, contributor_id on curricula
  for each row execute function curricula_build_search_vector();

-- Create a profile automatically for each new auth user.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, display_name)
  values (new.id, 'contributor', new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -----------------------------------------------------------------------------
-- Helper functions
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER avoids RLS recursion when checked inside policies.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Public, atomic download counter: logs a row and bumps the cached count,
-- but only for published curricula. Callable by anonymous readers.
create or replace function increment_download(p_curriculum_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from curricula where id = p_curriculum_id and status = 'published') then
    insert into curriculum_downloads (curriculum_id) values (p_curriculum_id);
    update curricula set download_count = download_count + 1 where id = p_curriculum_id;
  end if;
end;
$$;

grant execute on function increment_download(uuid) to anon, authenticated;
grant execute on function is_admin() to anon, authenticated;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table stages               enable row level security;
alter table subjects             enable row level security;
alter table languages            enable row level security;
alter table contributors         enable row level security;
alter table profiles             enable row level security;
alter table curricula            enable row level security;
alter table curriculum_downloads enable row level security;
alter table reports              enable row level security;

-- Reference data: world-readable.
create policy "read stages"       on stages       for select using (true);
create policy "read subjects"     on subjects     for select using (true);
create policy "read languages"    on languages    for select using (true);
create policy "read contributors" on contributors for select using (true);

-- Admins manage reference data.
create policy "admin write stages"       on stages       for all using (is_admin()) with check (is_admin());
create policy "admin write subjects"     on subjects     for all using (is_admin()) with check (is_admin());
create policy "admin write languages"    on languages    for all using (is_admin()) with check (is_admin());
create policy "admin write contributors" on contributors for all using (is_admin()) with check (is_admin());
-- Authenticated users may create contributor records (used during upload).
create policy "auth create contributors" on contributors for insert to authenticated with check (true);

-- Profiles: self read; admin read all; self update display_name.
create policy "read own profile"   on profiles for select using (auth.uid() = id or is_admin());
create policy "update own profile" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Curricula visibility.
create policy "read published curricula" on curricula for select using (status = 'published');
create policy "read own curricula"       on curricula for select using (auth.uid() = created_by);
create policy "admin read curricula"     on curricula for select using (is_admin());

-- Contributors insert their own rows (always as draft via app); admin anything.
create policy "insert own curricula" on curricula for insert to authenticated
  with check (auth.uid() = created_by);

-- Owners may edit only their own DRAFTS. Publishing/removing is admin-only.
create policy "update own draft curricula" on curricula for update to authenticated
  using (auth.uid() = created_by and status = 'draft')
  with check (auth.uid() = created_by and status = 'draft');

create policy "admin update curricula" on curricula for update
  using (is_admin()) with check (is_admin());

create policy "admin delete curricula" on curricula for delete using (is_admin());

-- Downloads: writes happen only through increment_download(); admins can read.
create policy "admin read downloads" on curriculum_downloads for select using (is_admin());

-- Reports: anyone may file a report; only admins read/update.
create policy "anyone insert reports" on reports for insert with check (true);
create policy "admin read reports"    on reports for select using (is_admin());
create policy "admin update reports"  on reports for update using (is_admin()) with check (is_admin());
