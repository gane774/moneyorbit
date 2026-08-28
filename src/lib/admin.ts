'use client';

import { supabase } from './supabase/client';

/**
 * Admin data access (Sections 6 and 7).
 *
 * Every function here calls an RPC that re-checks private.is_admin() inside
 * Postgres. The route guard in the UI is convenience only -- the actual
 * protection is that a non-admin calling these gets an empty result, whether
 * they come through the app or straight at /rest/v1/rpc (Section 36).
 */

export interface Overview {
  total_students: number;
  started_students: number;
  completed_students: number;
  active_7d: number;
  new_7d: number;
  /** Across EVERY registered student; a non-starter counts as 0. The
   *  honest headline figure. */
  avg_completion_pct: number;
  /** Among students who actually began. Useful for engagement, but it
   *  excludes everyone who bounced, so it must never be presented as
   *  overall completion. */
  avg_completion_pct_starters: number;
  total_experiences_done: number;
}
export interface FunnelRow {
  journey_id: string; title: string; order_index: number;
  started: number; completed: number; drop_off_pct: number;
}
export interface ConceptRow {
  concept_slug: string; title: string;
  reached: number; understood: number; understood_pct: number;
}
export interface BandRow { band: string; students: number; avg_completion_pct: number }
export interface ActivityRow {
  id: number; event_type: string; related_id: string | null;
  username: string; created_at: string;
}
export interface StudentRow {
  id: string; username: string; full_name: string; age: number; age_band: string;
  contact_method: string; contact_value: string;
  completed: number; completion_pct: number;
  created_at: string; last_active_at: string;
}

export async function adminSignIn(email: string, password: string): Promise<string | null> {
  const sb = supabase();
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return 'Email or password is not right.';
  if (!(await isAdmin())) {
    await sb.auth.signOut();
    return 'That account does not have admin access.';
  }
  return null;
}

/** True only when an admins row exists for the current session. */
export async function isAdmin(): Promise<boolean> {
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return false;
  const { data } = await sb.from('admins').select('id').eq('auth_user_id', session.user.id).maybeSingle();
  return Boolean(data);
}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T[]> {
  const { data, error } = await supabase().rpc(fn, args);
  if (error) return [];
  return (data as T[]) ?? [];
}

export const getOverview = async (): Promise<Overview | null> =>
  (await rpc<Overview>('admin_overview'))[0] ?? null;
export const getFunnel = () => rpc<FunnelRow>('admin_journey_funnel');
export const getConceptDifficulty = () => rpc<ConceptRow>('admin_concept_difficulty');
export const getByAgeBand = () => rpc<BandRow>('admin_by_age_band');
export const getRecentActivity = (n = 40) => rpc<ActivityRow>('admin_recent_activity', { limit_n: n });
export const getStudents = () => rpc<StudentRow>('admin_students');

/** Human phrasing for the live feed. */
export function describeEvent(e: ActivityRow, journeyTitle?: string): string {
  const what = journeyTitle ?? e.related_id ?? '';
  switch (e.event_type) {
    case 'account_created':      return `${e.username} created an account`;
    case 'experience_started':   return `${e.username} started ${what}`;
    case 'experience_completed': return `${e.username} completed ${what}`;
    case 'journey_completed':    return `${e.username} finished ${what}`;
    case 'course_completed':     return `${e.username} finished the whole course`;
    case 'quiz_scored':          return `${e.username} scored on ${what}`;
    case 'concept_mastered':     return `${e.username} mastered ${what}`;
    default:                     return `${e.username} — ${e.event_type}`;
  }
}
