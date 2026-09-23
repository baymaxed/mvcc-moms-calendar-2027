-- MVCC Moms Connect — playdate calendar schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

-- ============================================================
-- playdates: current/active state only
-- ============================================================
create table if not exists playdates (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  date date not null,
  start_time time not null,
  end_time time,

  host_name text not null,
  host_phone text,
  location_name text,
  address text,
  info text,

  status text not null default 'active'
    check (status in ('active', 'moved', 'cancelled')),

  weather_status text
    check (weather_status in (
      'weather_permitting', 'weather_pending', 'confirmed', 'cancelled_due_to_weather'
    )),

  -- Set once, on the FIRST move only. Always points back to the date/time
  -- that was originally announced, even through a chain of later moves.
  original_date date,
  original_start_time time,
  original_end_time time,
  moved_note text,

  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_playdates_date on playdates (date) where is_deleted = false;
create index if not exists idx_playdates_original_date on playdates (original_date) where is_deleted = false;

-- ============================================================
-- playdate_history: append-only audit log (backend-only, V1)
-- ============================================================
create table if not exists playdate_history (
  id uuid primary key default gen_random_uuid(),
  playdate_id uuid not null references playdates(id),
  action text not null
    check (action in (
      'created', 'edited', 'moved', 'cancelled', 'reactivated', 'weather_updated', 'deleted'
    )),
  actor_name text not null,
  before jsonb,
  after jsonb,
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists idx_history_playdate_id on playdate_history (playdate_id);

-- ============================================================
-- login_attempts: backs the passcode rate limiter
-- ============================================================
create table if not exists login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  success boolean not null,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_login_attempts_ip_time on login_attempts (ip_address, attempted_at);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table playdates enable row level security;
alter table playdate_history enable row level security;
alter table login_attempts enable row level security;

-- Public (anon key) may read only non-deleted playdates. No insert/update/
-- delete policy exists for playdates at all — every write goes through a
-- Next.js API route using the service-role key, which bypasses RLS entirely.
create policy "public can read active playdates"
  on playdates for select
  using (is_deleted = false);

-- playdate_history and login_attempts have RLS enabled with NO policies,
-- meaning the anon key can't read or write either table under any
-- circumstance. Only the service-role key (server-side only) can touch them.
