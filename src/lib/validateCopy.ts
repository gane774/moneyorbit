import type { ScreenCopy } from '@/content/types';

/**
 * Runtime validation for CMS-authored copy (Section 32).
 *
 * TypeScript types vanish at build time, so nothing stops the CMS writing a
 * malformed shape into age_variants -- and the player renders that copy to a
 * real student mid-lesson. This is the guard: publish is refused unless the
 * payload can actually drive all six screens.
 *
 * Deliberately strict about structure and permissive about wording. It checks
 * that required fields exist and are non-empty strings, not that the prose is
 * any good -- that is the author's job, not the validator's.
 */

export interface ValidationResult { ok: boolean; errors: string[] }

const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

function req(obj: Record<string, unknown> | undefined, path: string, keys: string[], errs: string[]) {
  if (!obj || typeof obj !== 'object') { errs.push(`${path} is missing`); return false; }
  for (const k of keys) if (!isStr(obj[k])) errs.push(`${path}.${k} must be a non-empty string`);
  return true;
}

export function validateScreenCopy(copy: unknown): ValidationResult {
  const errs: string[] = [];
  const c = copy as Record<string, Record<string, unknown>> | undefined;
  if (!c || typeof c !== 'object') return { ok: false, errors: ['copy must be an object'] };

  // hook
  if (req(c.hook, 'hook', ['kicker', 'headline', 'cta'], errs)) {
    const lines = c.hook.lines;
    if (!Array.isArray(lines) || lines.length === 0) errs.push('hook.lines must be a non-empty array');
    else lines.forEach((l, i) => {
      if (!l || typeof l !== 'object' || !isStr((l as Record<string, unknown>).text)) {
        errs.push(`hook.lines[${i}].text must be a non-empty string`);
      }
    });
  }

  // explain
  if (req(c.explain, 'explain', ['kicker', 'headline', 'cta'], errs)) {
    const body = c.explain.body;
    if (!Array.isArray(body) || body.length === 0) errs.push('explain.body must be a non-empty array');
    else body.forEach((b, i) => { if (!isStr(b)) errs.push(`explain.body[${i}] must be a non-empty string`); });
  }

  // interact — lockedCta is required (a missing nudge names no interaction)
  req(c.interact, 'interact', ['kicker', 'headline', 'lockedCta'], errs);

  // decide — options are optional (a committing screen has none), but when
  // present every option needs an id and title, and Feedback must carry a
  // verdict for each one or the student hits a blank screen after choosing.
  const decideOk = req(c.decide, 'decide', ['kicker', 'headline', 'cta'], errs);
  const optionIds: string[] = [];
  if (decideOk && c.decide.options !== undefined) {
    const opts = c.decide.options;
    if (!Array.isArray(opts)) errs.push('decide.options must be an array when present');
    else opts.forEach((o, i) => {
      const oo = o as Record<string, unknown>;
      if (!isStr(oo?.id)) errs.push(`decide.options[${i}].id must be a non-empty string`);
      else optionIds.push(oo.id as string);
      if (!isStr(oo?.title)) errs.push(`decide.options[${i}].title must be a non-empty string`);
    });
  }

  // feedback
  if (req(c.feedback, 'feedback', ['kicker', 'cta'], errs)) {
    const verdicts = c.feedback.verdicts as Record<string, unknown> | undefined;
    if (!verdicts || typeof verdicts !== 'object' || Object.keys(verdicts).length === 0) {
      errs.push('feedback.verdicts must have at least one verdict');
    } else {
      for (const [k, v] of Object.entries(verdicts)) {
        const vv = v as Record<string, unknown>;
        if (!isStr(vv?.title)) errs.push(`feedback.verdicts.${k}.title must be a non-empty string`);
        if (!isStr(vv?.body)) errs.push(`feedback.verdicts.${k}.body must be a non-empty string`);
        if (vv?.tone !== 'cost' && vv?.tone !== 'good') {
          errs.push(`feedback.verdicts.${k}.tone must be "cost" or "good"`);
        }
      }
      // A branching Decide screen whose Feedback has no matching verdict is
      // the failure a student actually sees: they choose, and get nothing.
      for (const id of optionIds) {
        if (!(id in verdicts)) errs.push(`feedback.verdicts is missing a verdict for decide option "${id}"`);
      }
    }
    const myth = c.feedback.myth as Record<string, unknown> | undefined;
    if (!myth || !isStr(myth.struck) || !isStr(myth.correction)) {
      errs.push('feedback.myth needs both struck and correction');
    }
    const vocab = c.feedback.vocab as Record<string, unknown> | undefined;
    if (!vocab || !isStr(vocab.term) || !isStr(vocab.definition)) {
      errs.push('feedback.vocab needs both term and definition');
    }
  }

  // practice — exactly one correct answer, or the quiz cannot be scored
  if (req(c.practice, 'practice', ['kicker', 'prompt', 'cta'], errs)) {
    const opts = c.practice.options;
    if (!Array.isArray(opts) || opts.length < 2) {
      errs.push('practice.options needs at least two options');
    } else {
      let correct = 0;
      opts.forEach((o, i) => {
        const oo = o as Record<string, unknown>;
        if (!isStr(oo?.id)) errs.push(`practice.options[${i}].id must be a non-empty string`);
        if (!isStr(oo?.title)) errs.push(`practice.options[${i}].title must be a non-empty string`);
        if (!isStr(oo?.rationale)) errs.push(`practice.options[${i}].rationale must be a non-empty string`);
        if (oo?.correct === true) correct++;
      });
      if (correct !== 1) errs.push(`practice needs exactly one correct option (found ${correct})`);
    }
  }

  return { ok: errs.length === 0, errors: errs };
}

/** Narrowing helper for callers that have already validated. */
export function asScreenCopy(copy: unknown): ScreenCopy {
  return copy as ScreenCopy;
}
