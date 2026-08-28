import { describe, it, expect } from 'vitest';
import {
  STARTING_STATE, EVENTS, ESSENTIALS_MONTHLY,
  payCost, advanceMonth, netWorth, summarise,
} from '@/lib/sim/lifeSim';

describe('life simulator', () => {
  it('spends cash before savings, and savings before borrowing', () => {
    const s = { ...STARTING_STATE, cash: 1_000, savings: 5_000, debt: 0, log: [] };
    const after = payCost(s, 3_000, 'test');
    expect(after.cash).toBe(0);
    expect(after.savings).toBe(3_000);
    expect(after.debt).toBe(0);
    expect(after.timesForcedToBorrow).toBe(0);
  });

  it('borrows only as a last resort, and counts it', () => {
    const s = { ...STARTING_STATE, cash: 500, savings: 500, debt: 0, log: [] };
    const after = payCost(s, 3_000, 'test');
    expect(after.cash).toBe(0);
    expect(after.savings).toBe(0);
    expect(after.debt).toBe(2_000);
    expect(after.timesForcedToBorrow).toBe(1);
  });

  it('a month applies income then essentials', () => {
    const s = { ...STARTING_STATE, cash: 0, savings: 0, debt: 0, log: [] };
    const after = advanceMonth(s);
    expect(after.cash).toBe(STARTING_STATE.incomeMonthly - ESSENTIALS_MONTHLY);
    expect(after.month).toBe(2);
  });

  it('debt accrues interest and spare cash is put against it automatically', () => {
    const s = { ...STARTING_STATE, cash: 0, savings: 0, debt: 10_000, log: [] };
    const after = advanceMonth(s);
    // 35,000 in, 22,000 essentials => 13,000 spare against ~10,150 of debt
    expect(after.debt).toBe(0);
    expect(after.cash).toBeGreaterThan(0);
  });

  it('never lets debt silently vanish when cash cannot cover it', () => {
    const s = { ...STARTING_STATE, cash: 0, savings: 0, debt: 500_000, log: [] };
    const after = advanceMonth(s);
    expect(after.debt).toBeGreaterThan(0);
  });

  it('netWorth subtracts debt', () => {
    expect(netWorth({ ...STARTING_STATE, cash: 100, savings: 50, debt: 30 })).toBe(120);
  });

  it('does not rank a richer-but-borrowing run above a poorer clean one', () => {
    // The explicit constraint from the brief: highest fictional wealth must
    // not be presented as the best outcome.
    const richButBorrowed = summarise({
      ...STARTING_STATE, cash: 200_000, savings: 0, debt: 0, timesForcedToBorrow: 3, month: 6, log: [],
    });
    const poorerButClean = summarise({
      ...STARTING_STATE, cash: 20_000, savings: 8_000, debt: 0, timesForcedToBorrow: 0, month: 6, log: [],
    });
    expect(poorerButClean.headline).toBe('Nothing forced your hand.');
    expect(richButBorrowed.headline).toBe('A surprise decided things for you.');
    // and net worth is reported, never used as a verdict
    expect(richButBorrowed.points.join(' ')).toContain('not a score');
  });

  it('every event offers at least one choice, so a run can never dead-end', () => {
    for (const e of EVENTS) {
      expect(e.choices.length, `${e.id} has no choices`).toBeGreaterThan(0);
    }
  });

  it('a full run completes and stays internally consistent', () => {
    let s = STARTING_STATE;
    for (const e of EVENTS) {
      s = advanceMonth(e.choices[0].apply(s));
    }
    expect(s.month).toBe(EVENTS.length + 1);
    expect(Number.isFinite(netWorth(s))).toBe(true);
    expect(s.debt).toBeGreaterThanOrEqual(0);
  });
});
