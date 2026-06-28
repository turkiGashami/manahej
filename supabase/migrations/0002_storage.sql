-- =============================================================================
-- Storage buckets + policies.
--   curricula : the PDF files
--   covers    : cover images
--
-- Both are PUBLIC-READ so published curricula expose stable public URLs (per
-- the brief). NOTE: a draft's file is also reachable by anyone who guesses its
-- (UUID) path. For stricter privacy, switch the curricula bucket to private and
-- serve downloads via short-lived signed URLs. (See README "Storage".)
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('curricula', 'curricula', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do update set public = excluded.public;

-- Public read.
create policy "public read curricula files"
  on storage.objects for select
  using (bucket_id = 'curricula');

create policy "public read cover files"
  on storage.objects for select
  using (bucket_id = 'covers');

-- Authenticated users may upload.
create policy "auth upload curricula files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'curricula');

create policy "auth upload cover files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'covers');

-- Owners may replace/remove their own uploaded objects; admins anything.
create policy "owner manage curricula files"
  on storage.objects for update to authenticated
  using (bucket_id = 'curricula' and owner = auth.uid());

create policy "owner delete curricula files"
  on storage.objects for delete to authenticated
  using (bucket_id in ('curricula', 'covers') and (owner = auth.uid() or is_admin()));
