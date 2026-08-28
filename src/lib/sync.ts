'use client';

import { supabase } from './supabase/client';
import { currentStudent } from './auth';
import * as P from './progress';
import { JOURNEY_BY_SLUG } from '@/content/journeys';
import { EXPERIENCES } from '@/content/experiences';
import type { MasteryState } from '@/content/types';

/**
 * Mirrors local progress to Postgres. localStorage stays the source of truth
 * for the lesson a student is in the middle of, so a refresh resumes instantly
 * without waiting on the network; Postgres is what makes that progress survive
 * a new device and what the admin dashboard reads.
 *
 * Every function here is non-throwing. A sync failure must never cost a
 * student the lesson they are in the middle of -- the local copy is still
 * correct, and the next successful push reconciles it.
 */

const expIdForJourneySlug = (slug: string): string | null => {
  const j = JOURNEY_BY_SLUG.get(slug);
  if (!j) return null;
  return EXPERIENCES.find((e) => e.journeyId === j.id)?.id ?? null;
};

/** Push the whole local state up. Safe to call repeatedly; rows are upserted. */
export async function pushProgress(): Promise<void> {
  try {
    const me = await currentStudent();
    if (!me) return;
    const local = P.load();
    const sb = supabase();

    const progressRows = Object.entries(local.resume)
      .map(([slug, r]) => {
        const experience_id = expIdForJourneySlug(slug);
        if (!experience_id) return null;
        return {
          student_id: me.id,
          experience_id,
          status: local.completed.includes(slug) ? 'complete' : 'in_progress',
          screen_index: r.screenIndex,
          decision: r.decision,
          completed_at: local.completed.includes(slug) ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    // A journey can be finished without a resume entry (the player clears it on
    // completion), so completed journeys are added separately or they would
    // never reach the database at all.
    for (const slug of local.completed) {
      const experience_id = expIdForJourneySlug(slug);
      if (!experience_id) continue;
      if (progressRows.some((r) => r && r.experience_id === experience_id)) continue;
      progressRows.push({
        student_id: me.id,
        experience_id,
        status: 'complete',
        screen_index: 5,
        decision: null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (progressRows.length) {
      await sb.from('progress').upsert(progressRows, { onConflict: 'student_id,experience_id' });
    }

    const masteryRows = Object.entries(local.mastery).map(([concept_slug, state]) => ({
      student_id: me.id,
      concept_slug,
      state,
      last_updated: new Date().toISOString(),
    }));
    if (masteryRows.length) {
      await sb.from('mastery').upsert(masteryRows, { onConflict: 'student_id,concept_slug' });
    }

    await sb.from('student_identity')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', me.id);
  } catch {
    /* best effort: the local copy is still authoritative */
  }
}

/**
 * Pull this account's progress down and merge it into local state. Used on
 * sign-in, where the device may be new (nothing local) or may hold a partial
 * anonymous run.
 *
 * The merge is deliberately a union rather than a replace: a student who did
 * two journeys signed-out on this device and has three on their account should
 * end up with five, not lose either set.
 */
export async function pullProgress(): Promise<void> {
  try {
    const me = await currentStudent();
    if (!me) return;
    const sb = supabase();

    const [{ data: prog }, { data: mast }] = await Promise.all([
      sb.from('progress').select('experience_id, status, screen_index, decision').eq('student_id', me.id),
      sb.from('mastery').select('concept_slug, state').eq('student_id', me.id),
    ]);

    const slugForExpId = (id: string): string | null => {
      const exp = EXPERIENCES.find((e) => e.id === id);
      if (!exp) return null;
      for (const [slug, j] of JOURNEY_BY_SLUG) if (j.id === exp.journeyId) return slug;
      return null;
    };

    P.update((p) => {
      const completed = new Set(p.completed);
      const resume = { ...p.resume };
      for (const row of prog ?? []) {
        const slug = slugForExpId(row.experience_id as string);
        if (!slug) continue;
        if (row.status === 'complete') {
          completed.add(slug);
          delete resume[slug];
        } else if (!resume[slug]) {
          resume[slug] = {
            screenIndex: (row.screen_index as number) ?? 0,
            decision: (row.decision as string | null) ?? null,
          };
        }
      }

      const mastery: Record<string, MasteryState> = { ...p.mastery };
      for (const row of mast ?? []) {
        mastery[row.concept_slug as string] = row.state as MasteryState;
      }

      return {
        ...p,
        studentId: me.id,
        username: me.username,
        fullName: me.full_name,
        age: me.age,
        ageBand: me.age_band as P.ProgressState['ageBand'],
        completed: [...completed],
        resume,
        mastery,
      };
    });
  } catch {
    /* best effort */
  }
}
