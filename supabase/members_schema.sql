-- Extensions
create extension if not exists "pgcrypto";

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
