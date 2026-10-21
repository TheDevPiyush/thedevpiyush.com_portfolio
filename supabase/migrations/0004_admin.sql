-- Phase 4: admin panel. Site settings, page-view analytics, refunds, the About story and a media bucket.
-- Safe to run more than once. All admin reads and writes go through the server (service role).

-- 1. Site-wide settings edited in /admin/settings (availability pill, resume link, SEO defaults).
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings for select to anon, authenticated using (true);

drop trigger if exists set_updated_at on public.site_settings;
create trigger set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- 2. Privacy-friendly page views from /api/track. No IPs or cookies: visitor_hash is a salted hash that
--    changes every day, so a visitor can't be followed across days.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) <= 300),
  referrer_host text check (char_length(referrer_host) <= 200),
  country text check (char_length(country) <= 2),
  device text check (device in ('desktop', 'mobile', 'tablet')),
  visitor_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

-- Everything the analytics pages need in one round trip. "visitors" counts unique visitors per day.
create or replace function public.page_view_stats(since timestamptz, tz text default 'UTC')
returns jsonb language sql stable security definer set search_path = public as $$
  with v as (select * from public.page_views where created_at >= since)
  select jsonb_build_object(
    'views', (select count(*) from v),
    'visitors', (select count(distinct (visitor_hash, (created_at at time zone tz)::date)) from v),
    'daily', coalesce((
      select jsonb_agg(d order by d.day) from (
        select (created_at at time zone tz)::date as day, count(*) as views, count(distinct visitor_hash) as visitors
        from v group by 1
      ) d), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(p) from (
        select path as label, count(*) as views from v group by path order by count(*) desc limit 15
      ) p), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(r) from (
        select referrer_host as label, count(*) as views from v
        where referrer_host is not null group by referrer_host order by count(*) desc limit 15
      ) r), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(c) from (
        select coalesce(country, '??') as label, count(*) as views from v group by 1 order by count(*) desc limit 15
      ) c), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(dv) from (
        select coalesce(device, 'desktop') as label, count(*) as views from v group by 1 order by count(*) desc
      ) dv), '[]'::jsonb)
  );
$$;

revoke all on function public.page_view_stats(timestamptz, text) from public, anon, authenticated;
grant execute on function public.page_view_stats(timestamptz, text) to service_role;

-- 3. Refunds are recorded from /admin/sales (the money itself is refunded in the Razorpay dashboard).
alter table public.project_purchases drop constraint if exists project_purchases_status_check;
alter table public.project_purchases add constraint project_purchases_status_check
  check (status in ('created', 'paid', 'failed', 'expired', 'refunded'));
alter table public.project_purchases add column if not exists refunded_at timestamptz;

-- 4. The About page story, previously hardcoded. Paragraphs are separated by blank lines.
alter table public.personal_info add column if not exists story text;
update public.personal_info set story = $story$I got into coding back in class 9, when my school computer teacher introduced us to Java. That first look at code really stuck with me. Then during the 2020 lockdown I finally got my first PC and started exploring languages and frameworks on my own.

Lockdown gave me the time (and patience) to really dive in. For me, programming isn't just about writing code. It feels more like art: the place where creativity and logic meet, and that's what keeps me hooked.$story$
where story is null;

-- 5. Public bucket for blog images, cover images, the avatar and the resume PDF.
--    Uploads use signed upload URLs created by admin-only server actions, so no storage policies are needed.
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
