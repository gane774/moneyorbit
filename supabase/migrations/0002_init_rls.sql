-- RLS enforced at the database layer, not only in application logic (Section 14).
--
-- The helper functions live in `private`, not `public`. In `public` they were
-- reachable at /rest/v1/rpc/is_admin by the anon role, which Supabase's own
-- security advisor flags. PostgREST only exposes configured schemas, so
-- `private` removes the HTTP route while policies can still call them.

create schema if not exists private;

grant usage on schema private to anon, authenticated;
alter table student_identity  enable row level security;
alter table consent_records   enable row level security;
alter table progress          enable row level security;
alter table mastery           enable row level security;
alter table quiz_attempts     enable row level security;
alter table activity_events   enable row level security;
alter table content_versions  enable row level security;
alter table admins            enable row level security;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins a where a.auth_user_id = auth.uid());
$$;

create or replace function private.current_student_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from student_identity where auth_user_id = auth.uid();
$$;


grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.current_student_id() to anon, authenticated;

-- A student reads and writes only their own rows.
create policy student_self_select on student_identity
  for select using (auth_user_id = auth.uid() or private.is_admin());
create policy student_self_update on student_identity
  for update using (auth_user_id = auth.uid());
create policy student_self_insert on student_identity
  for insert with check (auth_user_id = auth.uid());

create policy progress_own on progress
  for all using (student_id = private.current_student_id() or private.is_admin())
  with check (student_id = private.current_student_id());

create policy mastery_own on mastery
  for all using (student_id = private.current_student_id() or private.is_admin())
  with check (student_id = private.current_student_id());

create policy attempts_own on quiz_attempts
  for all using (student_id = private.current_student_id() or private.is_admin())
  with check (student_id = private.current_student_id());

-- Students may append their own events but never read the event stream.
create policy events_insert_own on activity_events
  for insert with check (student_id = private.current_student_id());
create policy events_admin_read on activity_events
  for select using (private.is_admin());

create policy consent_own on consent_records
  for all using (student_id = private.current_student_id() or private.is_admin())
  with check (student_id = private.current_student_id());

-- Only admins touch content versions.
create policy versions_admin on content_versions
  for all using (private.is_admin()) with check (private.is_admin());

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

create policy admin_write_journeys    on journeys    for all using (private.is_admin()) with check (private.is_admin());
create policy admin_write_experiences on experiences for all using (private.is_admin()) with check (private.is_admin());
create policy admin_write_variants    on age_variants for all using (private.is_admin()) with check (private.is_admin());
