-- OCRA policy foundation. Additive only: creates new tables, drops nothing.
-- Every table has row-level security on and no client policies, so only the server
-- (service role) can read or write. The access ledger is append-only.

create table if not exists public.access_ledger (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  actor_profile_id uuid references public.profiles(id),
  event_type text not null check (event_type in (
    'login','view','share','share_revoked','edit_request','edit_decided','print','download',
    'regenerate','comments_refreshed','career_tiers_changed','consent_given','consent_withdrawn',
    'deletion_requested','account_restored','guardian_change','report_verified','target_set','dispute'
  )),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.reject_ledger_change() returns trigger
language plpgsql as $$
begin
  raise exception 'access_ledger is append-only';
end;
$$;

drop trigger if exists access_ledger_no_update on public.access_ledger;
create trigger access_ledger_no_update before update or delete on public.access_ledger
for each row execute function public.reject_ledger_change();

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  created_by uuid not null references public.profiles(id),
  scope text not null check (scope in ('summary','progress','records')),
  recipient_mode text not null check (recipient_mode in ('guest','account')),
  recipient_profile_id uuid references public.profiles(id),
  recipient_email text,
  guest_token_hash text,
  expires_at timestamptz,
  last_activity_at timestamptz not null default now(),
  viewed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (recipient_mode = 'guest' and guest_token_hash is not null) or
    (recipient_mode = 'account' and recipient_profile_id is not null)
  )
);

create table if not exists public.edit_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  requested_by uuid not null references public.profiles(id),
  field text not null,
  proposed_value jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','declined','expired')),
  expires_at timestamptz not null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.edit_request_decisions (
  request_id uuid not null references public.edit_requests(id) on delete cascade,
  owner_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approve','decline')),
  decided_at timestamptz not null default now(),
  primary key (request_id, owner_id)
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  given_by uuid not null references public.profiles(id),
  terms_version text not null,
  given_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

create table if not exists public.next_targets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  subject text not null check (length(btrim(subject)) > 0),
  score integer not null check (score between 0 and 100),
  target integer not null check (target between 0 and 100),
  gap integer not null check (gap >= 0 and gap = greatest(0, target - score)),
  created_at timestamptz not null default now()
);

alter table public.access_ledger enable row level security;
alter table public.shares enable row level security;
alter table public.edit_requests enable row level security;
alter table public.edit_request_decisions enable row level security;
alter table public.consents enable row level security;
alter table public.next_targets enable row level security;

create index if not exists shares_student_idx on public.shares (student_id);
create index if not exists edit_requests_student_idx on public.edit_requests (student_id);
create index if not exists access_ledger_student_idx on public.access_ledger (student_id, created_at desc);
create index if not exists next_targets_student_idx on public.next_targets (student_id, created_at desc);
