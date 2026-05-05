-- Extensions
create extension if not exists "pgcrypto";

-- Admin allowlist table (create first - other policies depend on this)
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read own admin row"
  on public.admin_users
  for select
  using (auth.uid() = id);

-- Optional: allow admins to insert their own row (normally done by service role)
create policy "Admins can insert their row"
  on public.admin_users
  for insert
  with check (auth.uid() = id);

-- Member profiles
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  primary_provider text not null default 'email',
  linked_providers text[] not null default array['email']::text[],
  role text not null default 'Member',
  team text not null default 'Unassigned',
  contributions integer not null default 0,
  is_verified boolean not null default false,
  join_date date not null default current_date,
  created_at timestamptz default now()
);

create unique index if not exists members_user_id_key on public.members(user_id);
create unique index if not exists members_email_key on public.members(email);

alter table public.members enable row level security;

create policy "Members can read own profile"
  on public.members
  for select
  using (auth.uid() = user_id);

create policy "Members can insert own profile"
  on public.members
  for insert
  with check (auth.uid() = user_id);

create policy "Members can update own profile"
  on public.members
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can read members"
  on public.members
  for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can update members"
  on public.members
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can delete members"
  on public.members
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Meetings
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  notes text,
  created_at timestamptz default now()
);

alter table public.meetings enable row level security;

create policy "Members can read meetings"
  on public.meetings
  for select
  using (auth.uid() is not null);

create policy "Admins manage meetings"
  on public.meetings
  for insert
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins update meetings"
  on public.meetings
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins delete meetings"
  on public.meetings
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Attendance
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  status text not null default 'absent' check (status in ('present', 'absent')),
  feedback text not null default '',
  meeting_role text not null default '',
  updated_at timestamptz default now(),
  unique (member_id, meeting_id)
);

alter table public.attendance enable row level security;

create policy "Members can read their attendance"
  on public.attendance
  for select
  using (
    exists (
      select 1 from public.members
      where public.members.id = attendance.member_id
        and public.members.user_id = auth.uid()
    )
  );

create policy "Admins can read attendance"
  on public.attendance
  for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can update attendance"
  on public.attendance
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Members can insert attendance for self"
  on public.attendance
  for insert
  with check (
    exists (
      select 1 from public.members
      where public.members.id = attendance.member_id
        and public.members.user_id = auth.uid()
    )
  );

create policy "Admins can insert attendance"
  on public.attendance
  for insert
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can delete attendance"
  on public.attendance
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Auto-create attendance rows when members or meetings are created
create or replace function public.handle_new_member_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.attendance (member_id, meeting_id, status)
  select new.id, m.id, 'absent' from public.meetings m;
  return new;
end;
$$;

create or replace function public.handle_new_meeting_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.attendance (member_id, meeting_id, status)
  select m.id, new.id, 'absent' from public.members m;
  return new;
end;
$$;

drop trigger if exists on_members_created on public.members;
create trigger on_members_created
  after insert on public.members
  for each row execute function public.handle_new_member_attendance();

drop trigger if exists on_meetings_created on public.meetings;
create trigger on_meetings_created
  after insert on public.meetings
  for each row execute function public.handle_new_meeting_attendance();

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

-- Core content table for instant admin updates
create table if not exists public.site_content (
  id text primary key,
  hero_tagline text,
  hero_title text not null,
  hero_subtitle text not null,
  hero_cta text,
  hero_background_url text,
  shop_terms text,
  total_revenue text not null,
  total_profit text not null,
  total_donated text not null,
  active_members text not null,
  updated_at timestamptz default now()
);

alter table public.site_content enable row level security;
alter table public.site_content replica identity full;

create policy "Public read site content"
  on public.site_content
  for select
  using (true);

create policy "Admins update site content"
  on public.site_content
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins insert site content"
  on public.site_content
  for insert
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- Contact messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  is_resolved boolean not null default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Anyone can submit messages"
  on public.messages
  for insert
  with check (true);

create policy "Admins can read messages"
  on public.messages
  for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can update messages"
  on public.messages
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can delete messages"
  on public.messages
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  buyer_email text not null,
  total numeric not null,
  delivery_note text,
  items jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Anyone can place orders"
  on public.orders
  for insert
  with check (true);

create policy "Admins can read orders"
  on public.orders
  for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can update orders"
  on public.orders
  for update
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can delete orders"
  on public.orders
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Seed singleton content row (run once)
insert into public.site_content (id, hero_title, hero_subtitle, total_revenue, total_profit, total_donated, active_members)
values (
  'global',
  'Where Students Build Real Businesses',
  'A student-led entrepreneurship program. Learn market research, production, finance, and design by creating and selling real products.',
  '24850',
  '12430',
  '6200',
  '84'
)
on conflict (id) do nothing;
