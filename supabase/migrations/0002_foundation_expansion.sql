-- 0002 · Foundation expansion
-- Organisations, families, students, Brain Test, careers, reports, payments, notifications, AI cache.
-- Trusted writes (payments, memberships, AI cache, career enrichment) run in server code with the service-role key.
-- Row-level security denies everything not explicitly allowed below.

-- ---------- Helpers ----------

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'developer') and p.deleted_at is null
  );
$$;

create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (table_name, row_id, actor_id, action, before_data, after_data)
  values (
    tg_table_name,
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

-- ---------- Organisations and families ----------

create table public.organisations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 2 and 160),
  academic_systems text[] not null default '{}',
  country          text not null default 'KE',
  phone            text,
  created_by       uuid not null references public.profiles (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create table public.organisation_members (
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  member_role     text not null check (member_role in ('owner', 'admin', 'teacher')),
  created_at      timestamptz not null default now(),
  primary key (organisation_id, profile_id)
);

create or replace function public.is_org_member(org uuid, roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organisation_members m
    where m.organisation_id = org and m.profile_id = auth.uid() and m.member_role = any(roles)
  );
$$;

create table public.family_groups (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  name       text not null check (char_length(name) between 2 and 120),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- Students ----------

create table public.students (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null check (char_length(full_name) between 2 and 120),
  date_of_birth      date,
  family_id          uuid references public.family_groups (id) on delete cascade,
  organisation_id    uuid references public.organisations (id) on delete cascade,
  student_profile_id uuid references public.profiles (id) on delete set null,
  guardian_name      text,
  guardian_phone     text,
  working_language   text not null default 'en' check (working_language in ('en', 'sw')),
  document_language  text not null default 'en' check (document_language in ('en', 'sw')),
  motto              text check (char_length(motto) <= 280),
  avatar_path        text,
  created_by         uuid not null references public.profiles (id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz,
  constraint students_one_owner check ((family_id is not null) <> (organisation_id is not null))
);

create or replace function public.enforce_family_limit()
returns trigger language plpgsql as $$
begin
  if new.family_id is not null and (
    select count(*) from public.students s
    where s.family_id = new.family_id and s.deleted_at is null and s.id <> new.id
  ) >= 5 then
    raise exception 'A family account can hold up to 5 children.';
  end if;
  return new;
end;
$$;

create table public.student_accommodations (
  student_id       uuid primary key references public.students (id) on delete cascade,
  options          text[] not null default '{}'
                   check (options <@ array['extra_time', 'audio_format', 'large_print', 'reader_support', 'rest_breaks']::text[]),
  consent_given_by uuid not null references public.profiles (id),
  consent_given_at timestamptz not null default now()
);

create or replace function public.can_write_student(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff()
  or exists (
    select 1 from public.students s
    join public.family_groups f on f.id = s.family_id
    where s.id = sid and f.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.students s
    join public.organisation_members m on m.organisation_id = s.organisation_id
    where s.id = sid and m.profile_id = auth.uid() and m.member_role in ('owner', 'admin', 'teacher')
  );
$$;

create or replace function public.can_read_student(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_write_student(sid)
  or exists (
    select 1 from public.students s where s.id = sid and s.student_profile_id = auth.uid()
  );
$$;

create table public.academic_records (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students (id) on delete cascade,
  academic_system text not null,
  term            text not null,
  subject         text not null check (char_length(subject) between 1 and 80),
  score           numeric(5, 2) check (score between 0 and 100),
  grade           text,
  created_by      uuid not null references public.profiles (id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- ---------- Brain Test ----------

create table public.brain_test_questions (
  id         text primary key,
  dimension  text not null,
  prompt     text not null,
  kind       text not null check (kind in ('single', 'multi', 'scale', 'spatial')),
  options    jsonb not null default '[]'::jsonb,
  image_path text,
  version    int not null default 1,
  is_active  boolean not null default true
);

create table public.brain_test_sittings (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students (id) on delete cascade,
  status       text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);

create table public.brain_test_answers (
  sitting_id  uuid not null references public.brain_test_sittings (id) on delete cascade,
  question_id text not null references public.brain_test_questions (id),
  answer      jsonb not null,
  answered_at timestamptz not null default now(),
  primary key (sitting_id, question_id)
);

create table public.brain_test_scores (
  sitting_id uuid not null references public.brain_test_sittings (id) on delete cascade,
  dimension  text not null,
  score      numeric(6, 2) not null,
  primary key (sitting_id, dimension)
);

-- ---------- Careers ----------

create table public.career_requirements (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 2 and 120),
  normalised_name  text not null unique,
  subject_minimums jsonb not null default '{}'::jsonb,
  cognitive_fit    jsonb not null default '{}'::jsonb,
  salary_range     jsonb,
  training         jsonb,
  source           text not null check (source in ('seed', 'backdoor')),
  review_status    text not null default 'approved'
                   check (review_status in ('approved', 'pending_review', 'analysis_pending')),
  new_until        timestamptz,
  created_by       uuid references public.profiles (id) on delete set null,
  reviewed_by      uuid references public.profiles (id) on delete set null,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- ---------- Reports ----------

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students (id) on delete cascade,
  sitting_id    uuid references public.brain_test_sittings (id) on delete set null,
  kind          text not null,
  serial_number text not null unique
                check (serial_number ~ '^OCRA-[0-9]{6}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'),
  content       jsonb not null default '{}'::jsonb,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------- Payments and entitlements ----------

create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles (id) on delete cascade,
  student_id          uuid references public.students (id) on delete set null,
  provider            text not null check (provider in ('mpesa', 'stripe')),
  purpose             text not null,
  amount              numeric(12, 2) not null check (amount > 0),
  currency            text not null default 'KES',
  status              text not null default 'pending'
                      check (status in ('pending', 'succeeded', 'failed', 'cancelled')),
  checkout_request_id text unique,
  provider_reference  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.entitlements (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.students (id) on delete cascade,
  purpose    text not null,
  starts_at  timestamptz not null default now(),
  expires_at timestamptz not null,
  payment_id uuid references public.payments (id) on delete set null
);

-- ---------- Notifications and AI cache ----------

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind       text not null,
  title      text not null,
  body       text not null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_cache (
  cache_key  text primary key,
  response   jsonb not null,
  model      text not null,
  created_at timestamptz not null default now()
);

-- ---------- Triggers ----------

create trigger organisations_set_updated_at before update on public.organisations
  for each row execute function public.set_updated_at();
create trigger students_set_updated_at before update on public.students
  for each row execute function public.set_updated_at();
create trigger academic_records_set_updated_at before update on public.academic_records
  for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

create trigger students_family_limit before insert or update of family_id on public.students
  for each row execute function public.enforce_family_limit();

create trigger organisations_audit after insert or update or delete on public.organisations
  for each row execute function public.audit_row_change();
create trigger students_audit after insert or update or delete on public.students
  for each row execute function public.audit_row_change();
create trigger academic_records_audit after insert or update or delete on public.academic_records
  for each row execute function public.audit_row_change();
create trigger career_requirements_audit after insert or update or delete on public.career_requirements
  for each row execute function public.audit_row_change();
create trigger reports_audit after insert or update or delete on public.reports
  for each row execute function public.audit_row_change();
create trigger payments_audit after insert or update or delete on public.payments
  for each row execute function public.audit_row_change();

-- ---------- Row-level security ----------

alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.family_groups enable row level security;
alter table public.students enable row level security;
alter table public.student_accommodations enable row level security;
alter table public.academic_records enable row level security;
alter table public.brain_test_questions enable row level security;
alter table public.brain_test_sittings enable row level security;
alter table public.brain_test_answers enable row level security;
alter table public.brain_test_scores enable row level security;
alter table public.career_requirements enable row level security;
alter table public.reports enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_cache enable row level security;

create policy "organisations: members, creator and staff read" on public.organisations
  for select to authenticated
  using (public.is_staff() or created_by = auth.uid() or public.is_org_member(id, array['owner', 'admin', 'teacher']));
create policy "organisations: creator inserts" on public.organisations
  for insert to authenticated with check (created_by = auth.uid());
create policy "organisations: owners and admins update" on public.organisations
  for update to authenticated
  using (public.is_org_member(id, array['owner', 'admin']))
  with check (public.is_org_member(id, array['owner', 'admin']));

create policy "memberships: own, staff and fellow members read" on public.organisation_members
  for select to authenticated
  using (profile_id = auth.uid() or public.is_staff() or public.is_org_member(organisation_id, array['owner', 'admin', 'teacher']));

create policy "families: owner reads" on public.family_groups
  for select to authenticated using (owner_id = auth.uid() or public.is_staff());
create policy "families: owner creates" on public.family_groups
  for insert to authenticated with check (owner_id = auth.uid());
create policy "families: owner updates" on public.family_groups
  for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "students: readers read" on public.students
  for select to authenticated using (public.can_read_student(id));
create policy "students: writers create" on public.students
  for insert to authenticated
  with check (
    created_by = auth.uid() and (
      public.is_staff()
      or exists (select 1 from public.family_groups f where f.id = family_id and f.owner_id = auth.uid())
      or (organisation_id is not null and public.is_org_member(organisation_id, array['owner', 'admin', 'teacher']))
    )
  );
create policy "students: writers update" on public.students
  for update to authenticated
  using (public.can_write_student(id)) with check (public.can_write_student(id));

create policy "accommodations: writers read" on public.student_accommodations
  for select to authenticated using (public.can_write_student(student_id));
create policy "accommodations: writers insert" on public.student_accommodations
  for insert to authenticated
  with check (consent_given_by = auth.uid() and public.can_write_student(student_id));
create policy "accommodations: writers update" on public.student_accommodations
  for update to authenticated
  using (public.can_write_student(student_id)) with check (public.can_write_student(student_id));

create policy "academic: readers read" on public.academic_records
  for select to authenticated using (public.can_read_student(student_id));
create policy "academic: writers insert" on public.academic_records
  for insert to authenticated
  with check (created_by = auth.uid() and public.can_write_student(student_id));
create policy "academic: writers update" on public.academic_records
  for update to authenticated
  using (public.can_write_student(student_id)) with check (public.can_write_student(student_id));

create policy "questions: active read" on public.brain_test_questions
  for select to authenticated using (is_active);

create policy "sittings: readers read" on public.brain_test_sittings
  for select to authenticated using (public.can_read_student(student_id));
create policy "sittings: writers insert" on public.brain_test_sittings
  for insert to authenticated with check (public.can_write_student(student_id));
create policy "sittings: writers update" on public.brain_test_sittings
  for update to authenticated
  using (public.can_write_student(student_id)) with check (public.can_write_student(student_id));

create policy "answers: readers read" on public.brain_test_answers
  for select to authenticated using (exists (
    select 1 from public.brain_test_sittings s
    where s.id = sitting_id and public.can_read_student(s.student_id)));
create policy "answers: writers insert" on public.brain_test_answers
  for insert to authenticated with check (exists (
    select 1 from public.brain_test_sittings s
    where s.id = sitting_id and public.can_write_student(s.student_id)));

create policy "scores: readers read" on public.brain_test_scores
  for select to authenticated using (exists (
    select 1 from public.brain_test_sittings s
    where s.id = sitting_id and public.can_read_student(s.student_id)));

create policy "careers: approved read, staff read all" on public.career_requirements
  for select to authenticated using (review_status = 'approved' or public.is_staff());
create policy "careers: staff insert" on public.career_requirements
  for insert to authenticated with check (public.is_staff());
create policy "careers: staff update" on public.career_requirements
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "reports: student readers read" on public.reports
  for select to authenticated using (public.can_read_student(student_id));

create policy "payments: owner reads" on public.payments
  for select to authenticated using (profile_id = auth.uid());

create policy "entitlements: owner reads" on public.entitlements
  for select to authenticated using (profile_id = auth.uid());

create policy "notifications: owner reads" on public.notifications
  for select to authenticated using (profile_id = auth.uid());
create policy "notifications: owner marks read" on public.notifications
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- No policies on ai_cache: only the service role can touch it.

-- ---------- Grants (RLS still decides which rows) ----------

revoke all on all tables in schema public from anon;
revoke all on public.ai_cache from authenticated;

grant select on public.organisations, public.organisation_members, public.family_groups,
  public.students, public.student_accommodations, public.academic_records,
  public.brain_test_questions, public.brain_test_sittings, public.brain_test_answers,
  public.brain_test_scores, public.career_requirements, public.reports,
  public.payments, public.entitlements, public.notifications
  to authenticated;

grant insert, update on public.organisations, public.family_groups, public.students,
  public.student_accommodations, public.academic_records, public.brain_test_sittings,
  public.career_requirements, public.notifications
  to authenticated;

grant insert on public.brain_test_answers to authenticated;
