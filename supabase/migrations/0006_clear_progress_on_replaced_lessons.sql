-- Clear progress credited to lessons that no longer exist.
--
-- e01-e05 and e11 kept their ids through the 2026-09-01 curriculum revision
-- but received entirely new lessons. A progress row recorded against one of
-- them BEFORE the revision therefore credits a student with a lesson they
-- never saw: 0005 correctly renamed the journeys, so the dashboard reads
-- "Buy It Now, or Wait?" finished on 30 August as a completion of Inflation,
-- and the student is never offered the lesson that actually replaced it.
--
-- 14 rows across 5 students. Snapshot first, in the appended section of
-- supabase/backups/2026-09-02_pre_curriculum_resync.sql -- restoring that
-- block puts them back exactly as they were.
--
-- Scoped deliberately:
--   * e06-e10 were not rewritten, so their pre-revision rows are genuine
--     completions and stay.
--   * activity_events is an append-only log and is not touched. None of its
--     stale rows reach the live feed, which shows only the 40 most recent.
--
-- Applied to the live project on 2026-09-04. Re-running it is safe, and after
-- the cut-off date passes out of relevance it is simply a no-op.

delete from progress
where experience_id in ('e01','e02','e03','e04','e05','e11')
  and updated_at < timestamptz '2026-09-01 16:16+00';
