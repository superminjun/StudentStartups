-- CMS tables for Projects, Shop, and Impact
create extension if not exists "pgcrypto";

-- Projects
create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text not null,
  stage integer not null default 1,
  stage_name text not null default 'Planning',
  revenue numeric not null default 0,
  expenses numeric not null default 0,
  profit numeric not null default 0,
  donation numeric not null default 0,
  donation_percent numeric not null default 0,
  team jsonb not null default '[]'::jsonb,
  image_url text not null default '',
  start_date date not null default current_date,
  category text not null default '',
  term text not null default '',
  status text not null default 'active',
  created_at timestamptz default now()
);

alter table public.projects enable row level security;
alter table public.projects replica identity full;

create policy "Public read projects"
  on public.projects
  for select
  using (true);

create policy "Admins manage projects"
  on public.projects
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- Products
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price numeric not null default 0,
  image_url text not null default '',
  images jsonb not null default '[]'::jsonb,
  category text not null default '',
  inventory integer not null default 0,
  is_preorder boolean not null default false,
  project_id text,
  term text not null default '',
  status text not null default 'available' check (status in ('available', 'sold-out', 'in-production')),
  created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.products replica identity full;

create policy "Public read products"
  on public.products
  for select
  using (true);

create policy "Admins manage products"
  on public.products
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- Impact metrics
create table if not exists public.impact_metrics (
  id text primary key,
  label_en text not null,
  label_ko text not null,
  value numeric not null default 0,
  prefix text,
  suffix text,
  sort_order integer not null default 0
);

alter table public.impact_metrics enable row level security;
alter table public.impact_metrics replica identity full;

create policy "Public read impact metrics"
  on public.impact_metrics
  for select
  using (true);

create policy "Admins manage impact metrics"
  on public.impact_metrics
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- Impact charts
create table if not exists public.impact_revenue (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  revenue numeric not null default 0,
  expenses numeric not null default 0,
  sort_order integer not null default 0
);

alter table public.impact_revenue enable row level security;
alter table public.impact_revenue replica identity full;

create policy "Public read impact revenue"
  on public.impact_revenue
  for select
  using (true);

create policy "Admins manage impact revenue"
  on public.impact_revenue
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create table if not exists public.impact_donations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  value numeric not null default 0,
  sort_order integer not null default 0
);

alter table public.impact_donations enable row level security;
alter table public.impact_donations replica identity full;

create policy "Public read impact donations"
  on public.impact_donations
  for select
  using (true);

create policy "Admins manage impact donations"
  on public.impact_donations
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create table if not exists public.impact_member_growth (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  members integer not null default 0,
  sort_order integer not null default 0
);

alter table public.impact_member_growth enable row level security;
alter table public.impact_member_growth replica identity full;

create policy "Public read impact growth"
  on public.impact_member_growth
  for select
  using (true);

create policy "Admins manage impact growth"
  on public.impact_member_growth
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));
