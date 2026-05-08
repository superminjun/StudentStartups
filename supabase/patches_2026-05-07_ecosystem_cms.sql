create extension if not exists "pgcrypto";

alter table public.site_content add column if not exists intro_kicker text;
alter table public.site_content add column if not exists intro_title text;
alter table public.site_content add column if not exists intro_body text;
alter table public.site_content add column if not exists journal_kicker text;
alter table public.site_content add column if not exists journal_title text;
alter table public.site_content add column if not exists journal_body text;
alter table public.site_content add column if not exists join_title text;
alter table public.site_content add column if not exists join_body text;
alter table public.site_content add column if not exists join_cta text;

alter table public.impact_metrics add column if not exists description_en text;
alter table public.impact_metrics add column if not exists description_ko text;
alter table public.impact_metrics add column if not exists is_visible boolean not null default true;

alter table public.projects add column if not exists short_description text not null default '';
alter table public.projects add column if not exists slug text not null default '';
alter table public.projects add column if not exists problem text not null default '';
alter table public.projects add column if not exists solution text not null default '';
alter table public.projects add column if not exists gallery_images jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists lead_name text not null default '';
alter table public.projects add column if not exists contributors text[] not null default '{}'::text[];
alter table public.projects add column if not exists skills_used text[] not null default '{}'::text[];
alter table public.projects add column if not exists timeline jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists updates jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists impact_summary text not null default '';
alter table public.projects add column if not exists next_steps text not null default '';
alter table public.projects add column if not exists lessons text not null default '';
alter table public.projects add column if not exists is_featured boolean not null default false;
alter table public.projects add column if not exists is_published boolean not null default true;
alter table public.projects add column if not exists sort_order integer not null default 0;

create unique index if not exists projects_slug_key on public.projects (slug) where slug <> '';

create table if not exists public.member_showcases (
  id uuid primary key default gen_random_uuid(),
  member_id uuid unique references public.members(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete cascade,
  email text,
  slug text not null default '',
  short_description_en text,
  short_description_ko text,
  bio_en text,
  bio_ko text,
  why_joined_en text,
  why_joined_ko text,
  what_built_en text,
  what_built_ko text,
  quote_en text,
  quote_ko text,
  contribution_summary_en text,
  contribution_summary_ko text,
  leadership_en text[] not null default '{}'::text[],
  leadership_ko text[] not null default '{}'::text[],
  current_goals_en text[] not null default '{}'::text[],
  current_goals_ko text[] not null default '{}'::text[],
  achievements_en text[] not null default '{}'::text[],
  achievements_ko text[] not null default '{}'::text[],
  skills text[] not null default '{}'::text[],
  interests text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  links jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  profile_image_url text,
  banner_image_url text,
  is_founder boolean not null default false,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists member_showcases_slug_key on public.member_showcases (slug) where slug <> '';
create index if not exists member_showcases_email_idx on public.member_showcases (lower(email));

alter table public.member_showcases enable row level security;
alter table public.member_showcases replica identity full;

drop policy if exists "Public read member showcases" on public.member_showcases;
create policy "Public read member showcases"
  on public.member_showcases
  for select
  using (true);

drop policy if exists "Admins manage member showcases" on public.member_showcases;
create policy "Admins manage member showcases"
  on public.member_showcases
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create table if not exists public.story_content (
  id text primary key,
  eyebrow_en text,
  eyebrow_ko text,
  title_en text not null default '',
  title_ko text not null default '',
  intro_en text not null default '',
  intro_ko text not null default '',
  problem_en text not null default '',
  problem_ko text not null default '',
  why_started_en text not null default '',
  why_started_ko text not null default '',
  what_building_en text not null default '',
  what_building_ko text not null default '',
  how_we_work_en text not null default '',
  how_we_work_ko text not null default '',
  where_going_en text not null default '',
  where_going_ko text not null default '',
  quote_en text,
  quote_ko text,
  images jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.story_content enable row level security;
alter table public.story_content replica identity full;

drop policy if exists "Public read story content" on public.story_content;
create policy "Public read story content"
  on public.story_content
  for select
  using (true);

drop policy if exists "Admins manage story content" on public.story_content;
create policy "Admins manage story content"
  on public.story_content
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

insert into public.story_content (
  id,
  eyebrow_en,
  eyebrow_ko,
  title_en,
  title_ko,
  intro_en,
  intro_ko,
  problem_en,
  problem_ko,
  why_started_en,
  why_started_ko,
  what_building_en,
  what_building_ko,
  how_we_work_en,
  how_we_work_ko,
  where_going_en,
  where_going_ko,
  quote_en,
  quote_ko
)
values (
  'global',
  'Our Story',
  '우리의 이야기',
  'Why Student Startups exists.',
  '왜 Student Startups를 만들었는가',
  'Student Startups began as a response to a simple gap: students were surrounded by ideas, but rarely had a place to develop them into work that could survive real scrutiny.',
  'Student Startups는 단순한 문제의식에서 시작됐습니다. 아이디어는 많았지만, 그것을 실제 결과물로 끝까지 밀어붙일 구조는 거의 없었습니다.',
  'Students are often taught the language of product, design, and business long before they are given the chance to test those ideas in the open.',
  '학생들은 제품, 디자인, 비즈니스의 언어를 배웁니다. 하지만 그것을 실제로 검증해볼 기회는 드뭅니다.',
  'The platform was started to make that experience available earlier, with real teammates, documented work, and visible standards.',
  '이 플랫폼은 그 경험을 더 이른 시기에 가능하게 하기 위해 시작됐습니다. 실제 팀, 기록되는 작업, 분명한 기준이 핵심입니다.',
  'We are building a student-led system for projects, products, and documented progress, so that contributors leave with more than a list of intentions.',
  '우리는 프로젝트, 제품, 그리고 누적되는 실행 기록을 갖춘 학생 주도 시스템을 만들고 있습니다. 남는 것이 계획이 아니라 결과가 되도록 하기 위해서입니다.',
  'Meetings, design reviews, project updates, and post-mortems all matter. The process is part of the portfolio.',
  '미팅, 디자인 리뷰, 프로젝트 업데이트, 회고까지 모두 중요합니다. 과정 자체가 포트폴리오의 일부이기 때문입니다.',
  'The next phase is a stronger network of contributors, better tools for documenting work, and a more durable system for future teams.',
  '다음 단계는 더 강한 기여자 네트워크, 더 나은 기록 도구, 그리고 다음 팀에게도 남는 구조를 만드는 것입니다.',
  'Some of the work is polished. Some of it is still provisional. That is part of the point.',
  '완성된 것도 있고 아직 거친 것도 있습니다. 그 과정 자체가 이 플랫폼의 일부입니다.'
)
on conflict (id) do nothing;

create table if not exists public.journal_posts (
  id text primary key,
  slug text not null,
  title_en text not null default '',
  title_ko text not null default '',
  date date not null default current_date,
  author_name text,
  author_id uuid references public.members(id) on delete set null,
  category text not null default 'Reflection',
  summary_en text not null default '',
  summary_ko text not null default '',
  content_en text not null default '',
  content_ko text not null default '',
  lessons_en text,
  lessons_ko text,
  cover_image_url text,
  tags text[] not null default '{}'::text[],
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists journal_posts_slug_key on public.journal_posts (slug);

alter table public.journal_posts enable row level security;
alter table public.journal_posts replica identity full;

drop policy if exists "Public read journal posts" on public.journal_posts;
create policy "Public read journal posts"
  on public.journal_posts
  for select
  using (published = true);

drop policy if exists "Admins manage journal posts" on public.journal_posts;
create policy "Admins manage journal posts"
  on public.journal_posts
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create table if not exists public.media_items (
  id text primary key,
  title text,
  bucket text not null,
  file_path text not null,
  public_url text not null,
  category text,
  alt_text text,
  attached_type text,
  attached_id text,
  created_at timestamptz not null default now()
);

alter table public.media_items enable row level security;
alter table public.media_items replica identity full;

drop policy if exists "Public read media items" on public.media_items;
create policy "Public read media items"
  on public.media_items
  for select
  using (true);

drop policy if exists "Admins manage media items" on public.media_items;
create policy "Admins manage media items"
  on public.media_items
  for all
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));
