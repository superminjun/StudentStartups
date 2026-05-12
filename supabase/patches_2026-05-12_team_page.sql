-- Public Team page + Admin Team CMS
-- Run this once in Supabase SQL Editor before using the Admin "Team Page" tab.

create extension if not exists "pgcrypto";

create table if not exists public.team_profiles (
  id text primary key,
  member_id uuid references public.members(id) on delete cascade,
  full_name text not null default '',
  role_title text not null default 'Member',
  joined_date date,
  short_bio text not null default '',
  focus text not null default '',
  contribution text not null default '',
  current_work text not null default '',
  photo_url text not null default '',
  tags jsonb not null default '[]'::jsonb,
  is_founder boolean not null default false,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_profiles enable row level security;
alter table public.team_profiles replica identity full;

create index if not exists team_profiles_member_id_idx on public.team_profiles(member_id);
create index if not exists team_profiles_published_order_idx on public.team_profiles(is_published, is_featured, sort_order);

create or replace function public.set_team_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_team_profiles_updated_at on public.team_profiles;
create trigger set_team_profiles_updated_at
before update on public.team_profiles
for each row execute function public.set_team_profiles_updated_at();

drop policy if exists "Public read published team profiles" on public.team_profiles;
create policy "Public read published team profiles"
  on public.team_profiles
  for select
  using (is_published = true);

drop policy if exists "Admins manage team profiles" on public.team_profiles;
create policy "Admins manage team profiles"
  on public.team_profiles
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('team-images', 'team-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read team images" on storage.objects;
create policy "Public read team images"
  on storage.objects
  for select
  using (bucket_id = 'team-images');

drop policy if exists "Admins upload team images" on storage.objects;
create policy "Admins upload team images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'team-images'
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

drop policy if exists "Admins update team images" on storage.objects;
create policy "Admins update team images"
  on storage.objects
  for update
  using (
    bucket_id = 'team-images'
    and exists (select 1 from public.admin_users where id = auth.uid())
  )
  with check (
    bucket_id = 'team-images'
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

drop policy if exists "Admins delete team images" on storage.objects;
create policy "Admins delete team images"
  on storage.objects
  for delete
  using (
    bucket_id = 'team-images'
    and exists (select 1 from public.admin_users where id = auth.uid())
  );
