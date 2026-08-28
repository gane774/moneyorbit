'use client';

import { supabase } from './supabase/client';
import { validateScreenCopy } from './validateCopy';
import type { AgeBand } from '@/content/types';

/**
 * CMS write path (Section 32): draft -> preview -> publish.
 *
 *  - content_versions holds the history. Every save is a new numbered draft,
 *    so an edit is never destructive and a bad publish can be rolled back.
 *  - age_variants holds only what students actually receive. Nothing reaches
 *    it except through publish().
 *
 * Publishing validates first and refuses on failure. The whole point of this
 * layer is that editing copy without touching code cannot take a lesson down.
 */

export interface VersionRow {
  id: string;
  experience_id: string;
  version_number: number;
  status: 'draft' | 'preview' | 'published';
  payload: { band: AgeBand; copy?: unknown; params?: unknown };
  created_at: string;
  published_at: string | null;
}

export async function listVersions(experienceId: string): Promise<VersionRow[]> {
  const { data } = await supabase()
    .from('content_versions')
    .select('*')
    .eq('experience_id', experienceId)
    .order('version_number', { ascending: false });
  return (data as VersionRow[]) ?? [];
}

/** Save a new numbered draft. Never touches what students see. */
export async function saveDraft(
  experienceId: string,
  band: AgeBand,
  copy: unknown,
  params: unknown,
): Promise<{ ok: true; version: number } | { ok: false; error: string }> {
  const sb = supabase();
  const existing = await listVersions(experienceId);
  const next = (existing[0]?.version_number ?? 0) + 1;

  const { error } = await sb.from('content_versions').insert({
    experience_id: experienceId,
    version_number: next,
    status: 'draft',
    payload: { band, copy, params },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, version: next };
}

/**
 * Promote a draft to live. Validated first: a payload that cannot drive all
 * six screens is refused here rather than discovered by a student mid-lesson.
 */
export async function publish(
  version: VersionRow,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { band, copy, params } = version.payload;

  if (copy) {
    const v = validateScreenCopy(copy);
    if (!v.ok) {
      return { ok: false, error: `Cannot publish — ${v.errors.length} problem(s):\n• ${v.errors.join('\n• ')}` };
    }
  }

  const sb = supabase();
  const { error: upErr } = await sb.from('age_variants').upsert({
    experience_id: version.experience_id,
    age_band: band,
    copy: copy ?? {},
    params: params ?? {},
  }, { onConflict: 'experience_id,age_band' });
  if (upErr) return { ok: false, error: upErr.message };

  // Only one version per experience stays marked published, so the history
  // reads as a timeline rather than a pile of equally-current rows.
  await sb.from('content_versions')
    .update({ status: 'draft' })
    .eq('experience_id', version.experience_id)
    .eq('status', 'published');

  const { error } = await sb.from('content_versions')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', version.id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

/** Remove the override so the built-in TypeScript version takes over again. */
export async function unpublish(
  experienceId: string,
  band: AgeBand,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase()
    .from('age_variants')
    .delete()
    .eq('experience_id', experienceId)
    .eq('age_band', band);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function getPublished(experienceId: string, band: AgeBand) {
  const { data } = await supabase()
    .from('age_variants')
    .select('copy, params')
    .eq('experience_id', experienceId)
    .eq('age_band', band)
    .maybeSingle();
  return data as { copy: unknown; params: unknown } | null;
}
