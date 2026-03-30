-- Extend site_content for more hero controls

alter table public.site_content add column if not exists hero_tagline text;
alter table public.site_content add column if not exists hero_cta text;
alter table public.site_content add column if not exists hero_background_url text;
