-- 0001 · Personal account foundation
-- Run once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

create type public.account_type as enum ('personal', 'family', 'organization', 'developer');
create type public.account_role as enum ('user', 'admin', 'developer');

-- One profile per auth user. Created automatically on sign up.
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text not null check (char_length(full_name) between 2 and 120),
  account_type  public.account_type not null default 'personal',
  role          public.account_role not null default 'user',
  phone         text,
  country       text,
  locale        text not null default 'en',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- Keep updated_at honest.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Sign up always creates a personal profile. Client metadata cannot pick the type or role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mirror email changes from auth into the profile.
create or replace function public.sync_profile_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

-- Audit trail. Written by triggers only, read by service role only.
create table public.audit_log (
  id           bigint generated always as identity primary key,
  table_name   text not null,
  row_id       uuid not null,
  actor_id     uuid,
  action       text not null,
  before_data  jsonb,
  after_data   jsonb,
  occurred_at  timestamptz not null default now()
);

create or replace function public.audit_profile_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (table_name, row_id, actor_id, action, before_data, after_data)
  values (
    'profiles',
    case when tg_op = 'DELETE' then old.id else new.id end,
    auth.uid(),
    tg_op,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.audit_profile_change();

-- Row-level security.
alter table public.profiles enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles: owner reads own active row"
  on public.profiles for select to authenticated
  using (auth.uid() = id and deleted_at is null);

create policy "profiles: owner updates own active row"
  on public.profiles for update to authenticated
  using (auth.uid() = id and deleted_at is null)
  with check (auth.uid() = id and deleted_at is null);

-- Column-level grants: users may edit their own details, never type, role or deletion.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, country, locale) on public.profiles to authenticated;

revoke all on public.audit_log from anon, authenticated;
