import { describe, it, expect } from 'vitest';
import { shuffle } from '@/lib/shuffle';
import { EXPERIENCES, variantFor } from '@/content/experiences';
import { AGE_BANDS } from '@/content/types';

describe('shuffle', () => {
  it('keeps every element and does not mutate the input', () => {
    const src = [1, 2, 3, 4, 5];
    const copy = [...src];
    const out = shuffle(src);
    expect(src).toEqual(copy);               // untouched
    expect(out).toHaveLength(src.length);
    expect([...out].sort()).toEqual([...src].sort());
  });

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['only'])).toEqual(['only']);
  });

  it('actually reorders over repeated runs', () => {
    const src = [1, 2, 3, 4, 5, 6, 7, 8];
    const seen = new Set(Array.from({ length: 60 }, () => shuffle(src).join(',')));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('quiz answer position is not predictable', () => {
  /**
   * The authored content has the correct answer in the same slot for all 31
   * questions, which let a student score full marks by always picking the
   * middle option. Shuffling at render is what fixes that, so this asserts the
   * fix on the REAL content rather than on a synthetic array.
   */
  it('the authored bias is real, and is what this guards against', () => {
    const positions = new Set<number>();
    for (const e of EXPERIENCES) {
      for (const b of AGE_BANDS) {
        const v = variantFor(e, b);
        if (!v) continue;
        positions.add(v.copy.practice.options.findIndex((o) => o.correct));
      }
    }
    // Documents the flaw: every question authored with the answer in one slot.
    expect(positions.size).toBe(1);
  });

  it('spreads the correct answer across every slot once shuffled', () => {
    const counts: Record<number, number> = {};
    let total = 0;
    for (const e of EXPERIENCES) {
      for (const b of AGE_BANDS) {
        const v = variantFor(e, b);
        if (!v) continue;
        for (let run = 0; run < 40; run++) {
          const i = shuffle(v.copy.practice.options).findIndex((o) => o.correct);
          counts[i] = (counts[i] ?? 0) + 1;
          total++;
        }
      }
    }
    const slots = Object.keys(counts).length;
    expect(slots, 'answer never appeared in some slot').toBe(3);

    // No slot should dominate. Uniform would be ~33%; allow generous slack for
    // sampling noise while still failing loudly on a 100%-in-one-slot regression.
    for (const [slot, n] of Object.entries(counts)) {
      const share = n / total;
      expect(share, `slot ${slot} appeared ${(share * 100).toFixed(1)}% of the time`)
        .toBeGreaterThan(0.2);
      expect(share).toBeLessThan(0.47);
    }
  });
});
