alter table public.projects
  add column if not exists fundraise numeric not null default 0;

alter table public.projects
  add column if not exists banner_image_url text not null default '';
