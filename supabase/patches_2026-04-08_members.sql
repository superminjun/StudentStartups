-- Track verified members (only show confirmed users in admin)
alter table public.members
  add column if not exists is_verified boolean not null default false;

update public.members
set is_verified = true
where is_verified is distinct from true;
