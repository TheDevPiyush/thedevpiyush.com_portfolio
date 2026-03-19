-- Run in Supabase SQL editor

alter table public.projects
  add column if not exists is_sellable boolean default false,
  add column if not exists price_inr numeric(10,2),
  add column if not exists download_file_path text;

create table if not exists public.project_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  amount_inr numeric(10,2) not null,
  status text not null check (status in ('created', 'paid', 'failed', 'expired')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_purchases_user_project
  on public.project_purchases (user_id, project_id);
