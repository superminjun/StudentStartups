-- Patch: Admin tooling upgrades (roles, contributions, orders/messages status)

-- Attendance meeting role
alter table public.attendance
  add column if not exists meeting_role text not null default '';

-- Message status flags
alter table public.messages
  add column if not exists is_read boolean not null default false;

alter table public.messages
  add column if not exists is_resolved boolean not null default false;

-- Order status + completion timestamp
alter table public.orders
  add column if not exists status text not null default 'pending';

alter table public.orders
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_status_check'
  ) then
    alter table public.orders
      add constraint orders_status_check
      check (status in ('pending','completed','cancelled'));
  end if;
end $$;

-- Contributions log
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  points integer not null default 0,
  notes text,
  contribution_date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.contributions enable row level security;

-- Policies (drop/recreate to be safe)
drop policy if exists "Admins can update messages" on public.messages;
drop policy if exists "Admins can delete messages" on public.messages;

create policy "Admins can update messages"
  on public.messages
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can delete messages"
  on public.messages
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));


drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Admins can update orders"
  on public.orders
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can delete orders"
  on public.orders
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));


drop policy if exists "Members can read own contributions" on public.contributions;
drop policy if exists "Admins can manage contributions" on public.contributions;

create policy "Members can read own contributions"
  on public.contributions
  for select
  using (
    exists (
      select 1 from public.members
      where public.members.id = contributions.member_id
        and public.members.user_id = auth.uid()
    )
  );

create policy "Admins can manage contributions"
  on public.contributions
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));
