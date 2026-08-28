import { describe, it, expect } from 'vitest';
import { EXPERIENCES, isAvailable, variantFor } from '@/content/experiences';
import { JOURNEYS } from '@/content/journeys';
import { CONCEPTS } from '@/content/concepts';
import { AGE_BANDS, bandForAge, COMMIT_OPTION_ID } from '@/content/types';
import { validateScreenCopy } from '@/lib/validateCopy';

describe('content integrity', () => {
  it('has all 11 journeys and an experience for each', () => {
    expect(JOURNEYS).toHaveLength(11);
    expect(EXPERIENCES).toHaveLength(11);
    for (const j of JOURNEYS) {
      expect(EXPERIENCES.find((e) => e.journeyId === j.id), `no experience for ${j.id}`).toBeTruthy();
    }
  });

  it('ships no placeholder text anywhere', () => {
    for (const e of EXPERIENCES) {
      for (const band of AGE_BANDS) {
        const v = variantFor(e, band);
        if (!v) continue;
        expect(JSON.stringify(v), `${e.id}/${band} still contains placeholder copy`)
          .not.toContain('[PLACEHOLDER');
      }
    }
  });

  it('every concept an experience references actually exists', () => {
    const known = new Set(CONCEPTS.map((c) => c.slug));
    for (const e of EXPERIENCES) {
      for (const c of e.concepts) {
        expect(known.has(c), `${e.id} references unknown concept "${c}"`).toBe(true);
      }
    }
  });

  it('every authored variant passes the same validation the CMS enforces', () => {
    // The compiled content is the fallback the player drops to when a CMS
    // override is rejected. If it could not itself pass validation, that
    // fallback would be a broken lesson.
    for (const e of EXPERIENCES) {
      for (const band of AGE_BANDS) {
        const v = variantFor(e, band);
        if (!v) continue;
        const r = validateScreenCopy(v.copy);
        expect(r.errors, `${e.id}/${band}`).toEqual([]);
      }
    }
  });

  it('every branching Decide option has a matching verdict', () => {
    for (const e of EXPERIENCES) {
      for (const band of AGE_BANDS) {
        const v = variantFor(e, band);
        if (!v) continue;
        const opts = v.copy.decide.options ?? [];
        if (opts.length === 0) {
          // A committing screen must key its verdict to COMMIT_OPTION_ID or
          // the student sees nothing after pressing the CTA.
          expect(Object.keys(v.copy.feedback.verdicts), `${e.id}/${band} committing screen`)
            .toContain(COMMIT_OPTION_ID);
        } else {
          for (const o of opts) {
            expect(v.copy.feedback.verdicts[o.id], `${e.id}/${band} option "${o.id}"`).toBeTruthy();
          }
        }
      }
    }
  });

  it('every practice question has exactly one correct answer', () => {
    for (const e of EXPERIENCES) {
      for (const band of AGE_BANDS) {
        const v = variantFor(e, band);
        if (!v) continue;
        const correct = v.copy.practice.options.filter((o) => o.correct).length;
        expect(correct, `${e.id}/${band}`).toBe(1);
      }
    }
  });

  it('gates only Credit and Investing to 15+', () => {
    const gated = EXPERIENCES.filter((e) => !isAvailable(e, '12-14')).map((e) => e.id).sort();
    expect(gated).toEqual(['e06', 'e08']);
  });

  it('bandForAge is open-ended at the top and rejects nothing above 17', () => {
    expect(bandForAge(12)).toBe('12-14');
    expect(bandForAge(14)).toBe('12-14');
    expect(bandForAge(15)).toBe('15-16');
    expect(bandForAge(17)).toBe('17-18');
    expect(bandForAge(18)).toBe('17-18');
    expect(bandForAge(45)).toBe('17-18');
  });
});
