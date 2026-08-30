import { describe, it, expect } from 'vitest';
import {
  LIFE, LINES, STEP, takeHome, totalDeductions, totalCommitments, allocatable,
  totalAllocated, carRepair, judgeBonus, rentRise, buildReport, BONUS,
  type Alloc,
} from '@/lib/sim/finalChallenge';

// Both fixtures sum to exactly the ₹90,000 pool — the UI clamps, so an
// over-allocated plan is not a state a student can reach.
const reckless: Alloc = { groceries: 20_000, transport: 10_000, phone: 2_500, 'eating-out': 25_000, shopping: 15_000, entertainment: 15_000, subscriptions: 2_500, emergency: 0, investments: 0, 'goal-savings': 0 };
const balanced: Alloc = { groceries: 20_000, transport: 10_000, phone: 2_500, 'eating-out': 7_500, shopping: 7_500, entertainment: 7_500, subscriptions: 2_500, emergency: 20_000, investments: 12_500, 'goal-savings': 0 };

describe('the payslip', () => {
  it('take-home is gross minus every deduction', () => {
    expect(takeHome()).toBe(LIFE.grossMonthly - totalDeductions());
    expect(takeHome()).toBe(164_000);
  });

  it('what the student controls excludes committed costs', () => {
    expect(allocatable()).toBe(takeHome() - totalCommitments());
    expect(allocatable()).toBe(90_000);
  });

  it('the income is a genuinely adult one, per the brief', () => {
    expect(LIFE.grossMonthly).toBeGreaterThan(150_000);
  });

  it('the pool can be placed in a reasonable number of taps', () => {
    // The brief rules out clicking 200 times at this salary.
    expect(Math.ceil(allocatable() / STEP)).toBeLessThanOrEqual(12);
  });

  it('both sample allocations exactly consume the pool', () => {
    expect(totalAllocated(reckless)).toBe(allocatable());
    expect(totalAllocated(balanced)).toBe(allocatable());
  });
});

describe('events respond to the plan, not to luck', () => {
  it('a funded emergency absorbs the repair', () => {
    const r = carRepair(20_000, 3); // 60,000 saved vs a 35,000 repair
    expect(r.handledWell).toBe(true);
    expect(r.debtDelta).toBe(0);
  });

  it('no fund means the repair becomes debt', () => {
    const r = carRepair(0, 3);
    expect(r.handledWell).toBe(false);
    expect(r.debtDelta).toBe(35_000);
  });

  it('a partial fund produces partial debt, not all-or-nothing', () => {
    const r = carRepair(5_000, 3); // 15,000 saved
    expect(r.debtDelta).toBe(20_000);
    expect(r.handledWell).toBe(false);
  });

  it('the bonus has no single right answer — it depends on position', () => {
    // Carrying debt: clearing it wins, investing does not.
    expect(judgeBonus('debt', 35_000, 0, 60_000).handledWell).toBe(true);
    expect(judgeBonus('invest', 35_000, 0, 60_000).handledWell).toBe(false);
    // Debt-free with a real cushion: investing wins, clearing nothing does not.
    expect(judgeBonus('invest', 0, 400_000, 60_000).handledWell).toBe(true);
    expect(judgeBonus('debt', 0, 400_000, 60_000).handledWell).toBe(false);
  });

  it('spending the bonus is fine when the basics are covered, and not when they are not', () => {
    expect(judgeBonus('spend', 0, 400_000, 60_000).handledWell).toBe(true);
    expect(judgeBonus('spend', 0, 0, 60_000).handledWell).toBe(false);
  });

  it('a rent rise is absorbed where there is room and hurts where there is not', () => {
    expect(rentRise(reckless).handledWell).toBe(true);   // heavy lifestyle = cuttable
    const noSlack: Alloc = { groceries: 30_000, transport: 20_000, phone: 2_500, 'eating-out': 0, shopping: 0, entertainment: 0, subscriptions: 2_500, emergency: 20_000, investments: 15_000, 'goal-savings': 0 };
    expect(rentRise(noSlack).handledWell).toBe(false);
  });
});

describe('the report scores reasoning, not a hidden answer key', () => {
  const opts = { debt: 0, emergencyFund: 240_000, bonusHandledWell: true, rentHandledWell: true, repairHandledWell: true };

  it('two allocations a few thousand apart score the same', () => {
    // The brief: ₹10,000 vs ₹12,000 on eating out must not flip a verdict.
    const a: Alloc = { ...balanced };
    const b: Alloc = { ...balanced, 'eating-out': 10_000, shopping: 5_000 };
    const ra = buildReport(a, opts);
    const rb = buildReport(b, opts);
    expect(Math.abs(ra.overall - rb.overall)).toBeLessThanOrEqual(3);
  });

  it('separates a reckless year from a balanced one', () => {
    const bad = buildReport(reckless, { debt: 35_000, emergencyFund: 0, bonusHandledWell: false, rentHandledWell: false, repairHandledWell: false });
    const good = buildReport(balanced, opts);
    expect(good.overall).toBeGreaterThan(bad.overall + 25);
  });

  it('names emergency preparedness first when several dimensions tie at zero', () => {
    // Ties are common at the extremes; the advice given must be the one that
    // matters most, not whichever sorted last.
    const bad = buildReport(reckless, { debt: 35_000, emergencyFund: 0, bonusHandledWell: false, rentHandledWell: false, repairHandledWell: false });
    expect(bad.weakest.key).toBe('emergency');
  });

  it('penalises a plan with no room to adapt, even when it saves heavily', () => {
    const noLife: Alloc = { groceries: 15_000, transport: 5_000, phone: 2_500, 'eating-out': 0, shopping: 0, entertainment: 0, subscriptions: 0, emergency: 40_000, investments: 25_000, 'goal-savings': 2_500 };
    const r = buildReport(noLife, { debt: 0, emergencyFund: 480_000, bonusHandledWell: true, rentHandledWell: false, repairHandledWell: true });
    expect(r.weakest.key).toBe('flexibility');
    expect(r.dimensions.find((d) => d.key === 'growth')!.score).toBeGreaterThan(80);
  });

  it('every score stays inside 0-100 across wildly different plans', () => {
    const plans: Alloc[] = [reckless, balanced, {}, { emergency: 90_000 }, { 'eating-out': 90_000 }];
    for (const p of plans) {
      for (const d of buildReport(p, opts).dimensions) {
        expect(d.score).toBeGreaterThanOrEqual(0);
        expect(d.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('always produces an actionable change tied to the weakest dimension', () => {
    for (const p of [reckless, balanced, {}]) {
      const r = buildReport(p, opts);
      expect(r.oneChange.length).toBeGreaterThan(20);
      expect(r.strongest.score).toBeGreaterThanOrEqual(r.weakest.score);
    }
  });
});
