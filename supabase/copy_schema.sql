-- Site copy overrides for translations (editable in Admin)

create table if not exists public.site_copy (
  key text primary key,
  value_en text,
  value_ko text,
  updated_at timestamptz default now()
);

alter table public.site_copy enable row level security;
alter table public.site_copy replica identity full;

create policy "Public read site copy"
  on public.site_copy
  for select
  using (true);

create policy "Admins manage site copy"
  on public.site_copy
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));
