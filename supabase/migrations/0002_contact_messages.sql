-- ============================================================
-- 0002_contact_messages: messages from the /contact form.
-- Written only by the server (service role); RLS on with no policies, so the anon key can't read or write.
-- Safe to re-run.
-- ============================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  subject text check (subject is null or char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived', 'spam')),
  -- SHA-256 of the sender IP, used only for rate limiting. The raw IP is never stored.
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_ip_hash_idx on public.contact_messages (ip_hash, created_at desc);
