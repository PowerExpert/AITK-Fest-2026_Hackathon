-- Көпір — схема базы данных для Supabase.
-- Запустите этот файл целиком в Supabase Dashboard → SQL Editor → New query → Run.

-- Профиль пользователя: имя, возраст, регион.
-- Email и пароль Supabase хранит сам, в auth.users — сюда их дублировать не нужно.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age integer,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- История проверок резюме: текст резюме + полный ответ ИИ (JSON), привязаны к пользователю.
create table if not exists public.resume_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_text text not null,
  region text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.resume_checks enable row level security;

create policy "resume_checks_select_own" on public.resume_checks
  for select using (auth.uid() = user_id);

create policy "resume_checks_insert_own" on public.resume_checks
  for insert with check (auth.uid() = user_id);

create index if not exists resume_checks_user_id_created_at_idx
  on public.resume_checks (user_id, created_at desc);

-- Public counter for the landing page ("Уже помогли N людям").
-- RLS on resume_checks only lets users see their own rows, so a plain
-- count() from an anonymous visitor would always return 0. This function
-- runs with the privileges of its owner (security definer) and only ever
-- returns a single number — no resume text, no user data — so it's safe
-- to expose to anonymous visitors.
create or replace function public.resume_checks_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from public.resume_checks;
$$;

grant execute on function public.resume_checks_count() to anon, authenticated;
