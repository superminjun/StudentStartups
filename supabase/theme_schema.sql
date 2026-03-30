-- Site theme for fonts + colors

create table if not exists public.site_theme (
  id text primary key,
  font_url text,
  font_body text,
  font_heading text,
  base_font_size text,
  radius text,
  color_beige text,
  color_beige_dark text,
  color_warm_white text,
  color_charcoal text,
  color_dark text,
  color_mid text,
  color_light text,
  color_accent text,
  color_accent_soft text,
  updated_at timestamptz default now()
);

alter table public.site_theme enable row level security;
alter table public.site_theme replica identity full;

create policy "Public read site theme"
  on public.site_theme
  for select
  using (true);

create policy "Admins manage site theme"
  on public.site_theme
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));
