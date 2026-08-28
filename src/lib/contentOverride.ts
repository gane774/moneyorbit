'use client';

import { supabase } from './supabase/client';
import { validateScreenCopy, asScreenCopy } from './validateCopy';
import type { AgeBand, AgeVariant, Experience } from '@/content/types';

/**
 * Published CMS content overriding the TypeScript defaults (Section 32).
 *
 * TypeScript stays the source of truth and the fallback: with an empty
 * age_variants table nothing changes, and every experience keeps the copy that
 * was written and verified in code. A published row replaces it.
 *
 * Overrides are validated again here, at read time, not only at publish time.
 * A row could have been written before a validation rule existed, or edited
 * directly in SQL. If it does not pass, the TypeScript version is used and the
 * student sees a working lesson rather than a broken one.
 */
export async function fetchOverride(
  experienceId: string,
  band: AgeBand,
): Promise<Partial<AgeVariant> | null> {
  try {
    const { data, error } = await supabase()
      .from('age_variants')
      .select('params, copy')
      .eq('experience_id', experienceId)
      .eq('age_band', band)
      .maybeSingle();

    if (error || !data) return null;

    const copy = (data as Record<string, unknown>).copy;
    const params = (data as Record<string, unknown>).params;

    const hasCopy = copy && typeof copy === 'object' && Object.keys(copy).length > 0;
    if (!hasCopy) {
      // params-only override is legitimate: retuning a simulation without
      // touching a word of the script (Section 33).
      const hasParams = params && typeof params === 'object' && Object.keys(params).length > 0;
      return hasParams ? { params: params as Record<string, unknown> } : null;
    }

    const v = validateScreenCopy(copy);
    if (!v.ok) {
      console.warn(
        `[content] Published override for ${experienceId}/${band} failed validation; ` +
        `falling back to the built-in version.`, v.errors,
      );
      return null;
    }

    return {
      copy: asScreenCopy(copy),
      ...(params && Object.keys(params as object).length ? { params: params as Record<string, unknown> } : {}),
    };
  } catch {
    return null;
  }
}

/** Merge a published override onto the compiled experience for one band. */
export function applyOverride(
  exp: Experience,
  band: AgeBand,
  override: Partial<AgeVariant> | null,
): Experience {
  const base = exp.ageVariants[band];
  if (!override || !base) return exp;
  return {
    ...exp,
    ageVariants: {
      ...exp.ageVariants,
      [band]: {
        ...base,
        ...(override.copy ? { copy: override.copy } : {}),
        ...(override.params ? { params: { ...base.params, ...override.params } } : {}),
      },
    },
  };
}
