
-- INOZE MUSIC STORE
create extension if not exists pgcrypto;

create table if not exists public.beats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null default 'INOZE',
  bpm integer not null,
  key text not null,
  genre text,
  price integer not null default 0,
  cover_url text,
  audio_url text,
  description text,
  status text not null default 'active' check (status in ('active','hidden')),
  wav boolean not null default true,
  stems boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid references public.beats(id) on delete set null,
  beat_title text not null,
  license text not null,
  price integer not null default 0,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  note text,
  status text not null default 'new' check (status in ('new','processed')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  project_type text not null,
  genre text,
  bpm integer,
  message text not null,
  status text not null default 'new' check (status in ('new','replied')),
  created_at timestamptz not null default now()
);

alter table public.beats enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;

-- Public website may READ active beats only.
create policy "public read active beats"
on public.beats for select
to anon, authenticated
using (status = 'active');

-- Public visitors may submit purchase/contact requests.
create policy "public create orders"
on public.orders for insert
to anon, authenticated
with check (true);

create policy "public create messages"
on public.messages for insert
to anon, authenticated
with check (true);

-- IMPORTANT:
-- Do NOT create public update/delete policies.
-- Admin changes should go through authenticated admin users.

-- Storage buckets (create them in Dashboard > Storage if SQL creation is unavailable).
-- Recommended bucket names:
-- beat-covers
-- beat-previews

-- After creating your admin account in Supabase Auth, replace the email below
-- with your real admin email and use the admin policy section in SETUP.md.
