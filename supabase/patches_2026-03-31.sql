-- Add shop term settings to site content

alter table public.site_content add column if not exists shop_terms text;
