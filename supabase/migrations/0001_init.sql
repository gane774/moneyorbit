-- MoneyOrbit initial schema (Section 10).
-- Identity and learning data are separated from day one (Section 9): this
-- costs nothing now and makes a future privacy retrofit a migration rather
-- than a rebuild.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- identity

create table student_identity (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid unique references auth.users(id) on delete cascade,
  username       text unique not null check (char_length(username) between 3 and 32),
  full_name      text not null,
  age            int  not null check (age between 12 and 18),
  age_band       text not null check (age_band in ('12-14','15-16','17-18')),
  contact_method text not null check (contact_method in ('email','phone')),
  contact_value  text not null,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- Present and unused for MVP. The verifiable-parental-consent flow is NOT
-- built (Section 9); the table exists so the architecture does not assume
-- it never will be. Under India's DPDP Act a "child" is anyone under 18,
-- which is the entire user base — see the open item in Section 22.
create table consent_records (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references student_identity(id) on delete cascade,
  method       text,
  verified_at  timestamptz,
  guardian_ref text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- content

create table journeys (
  id            text primary key,
  slug          text unique not null,
  title         text not null,
  short_title   text not null,
  order_index   int  not null unique,
  color_token   text not null,
  est_minutes   int  not null default 4
);

create table experiences (
  id             text primary key,
  journey_id     text not null references journeys(id) on delete cascade,
  slug           text unique not null,
  title          text not null,
  mechanic_type  text not null,
  is_core        boolean not null default true,
  -- Section 18: facts that go stale must be flagged, never hardcoded as
  -- permanent truths, so the CMS can surface them for review.
  time_sensitive boolean not null default false,
  verified_as_of date
);

create table age_variants (
  experience_id text not null references experiences(id) on delete cascade,
  age_band      text not null check (age_band in ('12-14','15-16','17-18')),
  params        jsonb not null default '{}'::jsonb,
  copy          jsonb not null default '{}'::jsonb,
  primary key (experience_id, age_band)
);

create table concepts (
  slug            text primary key,
  title           text not null,
  is_core_concept boolean not null default false
);

create table experience_concepts (
  experience_id text not null references experiences(id) on delete cascade,
  concept_slug  text not null references concepts(slug) on delete cascade,
  primary key (experience_id, concept_slug)
);

create table questions (
  id            uuid primary key default gen_random_uuid(),
  experience_id text not null references experiences(id) on delete cascade,
  prompt        text not null,
  type          text not null default 'practice'
                check (type in ('practice','quick_check'))
);

create table question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  text        text not null,
  rationale   text,
  is_correct  boolean not null default false
);

-- draft -> preview -> publish. The student site reads only `published`.
create table content_versions (
  id             uuid primary key default gen_random_uuid(),
  experience_id  text not null references experiences(id) on delete cascade,
  version_number int  not null,
  status         text not null default 'draft'
                 check (status in ('draft','preview','published')),
  payload        jsonb not null,
  created_by     uuid,
  created_at     timestamptz not null default now(),
  published_at   timestamptz,
  unique (experience_id, version_number)
);

-- Only one published version per experience at a time.
create unique index content_versions_one_published
  on content_versions (experience_id)
  where status = 'published';

-- ---------------------------------------------------------------- learning

create table progress (
  student_id    uuid not null references student_identity(id) on delete cascade,
  experience_id text not null references experiences(id) on delete cascade,
  status        text not null default 'in_progress'
                check (status in ('in_progress','complete')),
  screen_index  int  not null default 0,
  decision      text,
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (student_id, experience_id)
);

create table mastery (
  student_id   uuid not null references student_identity(id) on delete cascade,
  concept_slug text not null references concepts(slug) on delete cascade,
  state        text not null check (state in
                 ('introduced','practicing','understood','applied','mastered')),
  last_updated timestamptz not null default now(),
  primary key (student_id, concept_slug)
);

create table quiz_attempts (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references student_identity(id) on delete cascade,
  question_id        uuid not null references questions(id) on delete cascade,
  selected_option_id uuid references question_options(id) on delete set null,
  correct            boolean not null,
  attempted_at       timestamptz not null default now()
);

-- Only educationally or operationally meaningful events (Section 13).
-- Never every click.
create table activity_events (
  id         bigserial primary key,
  student_id uuid references student_identity(id) on delete set null,
  event_type text not null check (event_type in (
    'account_created','experience_started','experience_completed',
    'journey_completed','concept_mastered','quiz_scored','course_completed'
  )),
  related_id text,
  is_minor   boolean not null,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_events_recent on activity_events (created_at desc);
create index progress_student on progress (student_id);
create index mastery_student on mastery (student_id);

create table admins (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  email         text unique not null,
  role          text not null default 'editor' check (role in ('editor','owner')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- RLS
-- Enforced at the database layer, not only in application logic (Section 14).

alter table student_identity  enable row level security;
alter table consent_records   enable row level security;
alter table progress          enable row level security;
alter table mastery           enable row level security;
alter table quiz_attempts     enable row level security;
alter table activity_events   enable row level security;
alter table content_versions  enable row level security;
alter table admins            enable row level security;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins a where a.auth_user_id = auth.uid());
$$;

create or replace function current_student_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from student_identity where auth_user_id = auth.uid();
$$;

-- A student reads and writes only their own rows.
create policy student_self_select on student_identity
  for select using (auth_user_id = auth.uid() or is_admin());
create policy student_self_update on student_identity
  for update using (auth_user_id = auth.uid());
create policy student_self_insert on student_identity
  for insert with check (auth_user_id = auth.uid());

create policy progress_own on progress
  for all using (student_id = current_student_id() or is_admin())
  with check (student_id = current_student_id());

create policy mastery_own on mastery
  for all using (student_id = current_student_id() or is_admin())
  with check (student_id = current_student_id());

create policy attempts_own on quiz_attempts
  for all using (student_id = current_student_id() or is_admin())
  with check (student_id = current_student_id());

-- Students may append their own events but never read the event stream.
create policy events_insert_own on activity_events
  for insert with check (student_id = current_student_id());
create policy events_admin_read on activity_events
  for select using (is_admin());

create policy consent_own on consent_records
  for all using (student_id = current_student_id() or is_admin())
  with check (student_id = current_student_id());

-- Only admins touch content versions.
create policy versions_admin on content_versions
  for all using (is_admin()) with check (is_admin());

create policy admins_self on admins
  for select using (auth_user_id = auth.uid());

-- Published content is world-readable; these tables carry no personal data.
alter table journeys            enable row level security;
alter table experiences         enable row level security;
alter table age_variants        enable row level security;
alter table concepts            enable row level security;
alter table experience_concepts enable row level security;
alter table questions           enable row level security;
alter table question_options    enable row level security;

create policy public_read_journeys    on journeys            for select using (true);
create policy public_read_experiences on experiences         for select using (true);
create policy public_read_variants    on age_variants        for select using (true);
create policy public_read_concepts    on concepts            for select using (true);
create policy public_read_expconcepts on experience_concepts for select using (true);
create policy public_read_questions   on questions           for select using (true);
create policy public_read_options     on question_options    for select using (true);

create policy admin_write_journeys    on journeys    for all using (is_admin()) with check (is_admin());
create policy admin_write_experiences on experiences for all using (is_admin()) with check (is_admin());
create policy admin_write_variants    on age_variants for all using (is_admin()) with check (is_admin());
