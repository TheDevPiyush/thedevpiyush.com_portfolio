-- ============================================================
-- 0001_security: lock the database down to read-only public data.
-- Run in the Supabase SQL editor AFTER deploying the app code from
-- the same PR (the app now does every write with the service role).
-- Safe to re-run.
-- ============================================================

-- 1. RLS on every app table. Drop pre-existing policies so only the ones below apply.
do $$
declare
  t text;
  pol record;
begin
  foreach t in array array[
    'personal_info', 'experiences', 'education', 'skills', 'certifications', 'blog_posts',
    'portfolio_stats', 'interests', 'projects', 'users', 'project_purchases'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;
  end loop;
end $$;

-- 2. Public read-only access to published content. No insert/update/delete policies for anon or
--    authenticated, so those writes are denied. The service role bypasses RLS.
create policy "public read" on public.personal_info for select to anon, authenticated using (true);
create policy "public read" on public.experiences for select to anon, authenticated using (is_active);
create policy "public read" on public.education for select to anon, authenticated using (is_active);
create policy "public read" on public.skills for select to anon, authenticated using (is_active);
create policy "public read" on public.certifications for select to anon, authenticated using (is_active);
create policy "public read" on public.portfolio_stats for select to anon, authenticated using (is_active);
create policy "public read" on public.interests for select to anon, authenticated using (is_active);
create policy "public read" on public.blog_posts for select to anon, authenticated using (is_published);
create policy "public read" on public.projects for select to anon, authenticated using (is_active);

-- users and project_purchases: no policies at all, so only the service role can read or write them.

-- 3. Hide the paid ZIP path from the public API (RLS is row-level, so use column grants).
revoke select on public.projects from anon, authenticated;
grant select (
  id, title, description, long_description, tech_stack, features, stats, github_url, live_url, demo_url,
  image_url, is_featured, category, display_order, is_active, is_sellable, price_inr,
  setup_guide_file_path, screenshot_urls, created_at, updated_at
) on public.projects to anon, authenticated;

-- 4. Keep updated_at honest.
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'personal_info', 'experiences', 'education', 'skills', 'certifications', 'blog_posts',
    'portfolio_stats', 'projects', 'project_purchases'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t
    );
  end loop;
end $$;

-- 5. users rows belong to real auth users and are created by the database, never by clients.
--    NOT VALID skips checking existing rows; run the audit query below, clean up, then:
--    alter table public.users validate constraint users_id_auth_fkey;
alter table public.users drop constraint if exists users_id_auth_fkey;
alter table public.users
  add constraint users_id_auth_fkey foreign key (id) references auth.users (id) on delete cascade not valid;

create or replace function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- 6. Unique slug for blog URLs.
--    Fails if duplicates exist; fix them first: select url, count(*) from blog_posts group by url having count(*) > 1;
create unique index if not exists blog_posts_url_key on public.blog_posts (url) where url is not null;

-- ============================================================
-- Audit (run separately and review):
--   -- users rows with no matching auth user (inserted through the old open API)
--   select u.* from public.users u left join auth.users a on a.id = u.id where a.id is null;
--   -- everyone with admin rights
--   select u.id, u.email, u.created_at, a.last_sign_in_at
--   from public.users u left join auth.users a on a.id = u.id where u."isAdmin";
-- ============================================================
