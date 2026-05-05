alter table public.members
  add column if not exists primary_provider text not null default 'email',
  add column if not exists linked_providers text[] not null default array['email']::text[];

update public.members
set primary_provider = coalesce(nullif(primary_provider, ''), 'email')
where primary_provider is null or primary_provider = '';

update public.members
set linked_providers = case
  when linked_providers is null or cardinality(linked_providers) = 0 then array[primary_provider]
  else linked_providers
end;
