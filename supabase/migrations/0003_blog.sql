-- Phase 3: Markdown posts, scheduling, SEO fields and view counts. Safe to run more than once.
-- After running it, convert the existing HTML posts:
--   node --env-file=.env.local scripts/convert-blog-html-to-markdown.mjs          (preview)
--   node --env-file=.env.local scripts/convert-blog-html-to-markdown.mjs --write  (save)

-- 1. New columns. `content` (legacy HTML) stays as a fallback until every post has content_md.
alter table public.blog_posts
  add column if not exists content_md text,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

update public.blog_posts set tags = '{}' where tags is null;
alter table public.blog_posts alter column tags set default '{}';
alter table public.blog_posts alter column tags set not null;

-- 2. Scheduling: a post is live when is_published and publish_date has passed.
--    The old default, now() at time zone 'utc', produced a timestamp without a zone.
update public.blog_posts set publish_date = coalesce(created_at, now()) where publish_date is null;
alter table public.blog_posts alter column publish_date set default now();
alter table public.blog_posts alter column publish_date set not null;

drop policy if exists "public read" on public.blog_posts;
create policy "public read" on public.blog_posts
  for select to anon, authenticated using (is_published and publish_date <= now());

-- 3. View counts must not bump updated_at (it feeds the sitemap and dateModified).
create or replace function public.blog_posts_set_updated_at() returns trigger
language plpgsql as $$
begin
  if (to_jsonb(new) - 'view_count' - 'updated_at') is distinct from (to_jsonb(old) - 'view_count' - 'updated_at') then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end $$;

drop trigger if exists set_updated_at on public.blog_posts;
create trigger set_updated_at before update on public.blog_posts
  for each row execute function public.blog_posts_set_updated_at();

-- 4. Atomic view counter. Called only by the server (service role) from /api/blog/views.
create or replace function public.increment_post_view(post_slug text) returns integer
language sql security definer set search_path = public as $$
  update public.blog_posts
     set view_count = coalesce(view_count, 0) + 1
   where url = post_slug and is_published and publish_date <= now()
  returning view_count;
$$;

revoke all on function public.increment_post_view(text) from public, anon, authenticated;
grant execute on function public.increment_post_view(text) to service_role;
