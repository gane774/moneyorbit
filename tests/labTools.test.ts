import { describe, it, expect } from 'vitest';
import { summariseBudget, DEFAULT_LINES, type BudgetLine } from '@/lib/sim/budget';
import { STATEMENT, OPENING_BALANCE, runningBalance, summarise } from '@/lib/sim/statement';

const withAmounts = (m: Record<string, number>): BudgetLine[] =>
  DEFAULT_LINES.map((l) => ({ ...l, amount: m[l.id] ?? 0 }));

describe('budget simulator', () => {
  it('reports shares of income, not of what was allocated', () => {
    // Half the income unassigned: needs is 25% of INCOME, not 50% of spending.
    const s = summariseBudget(40_000, withAmounts({ rent: 10_000, aside: 10_000 }));
    expect(s.sharePct.needs).toBe(25);
    expect(s.sharePct.savings).toBe(25);
    expect(s.remaining).toBe(20_000);
  });

  it('flags overspending with the exact shortfall', () => {
    const s = summariseBudget(10_000, withAmounts({ rent: 8_000, fun: 5_000 }));
    expect(s.overspent).toBe(true);
    expect(s.remaining).toBe(-3_000);
    expect(s.notes.join(' ')).toContain('3,000 more than comes in');
  });

  it('says so when nothing is set aside', () => {
    const s = summariseBudget(20_000, withAmounts({ rent: 15_000, fun: 5_000 }));
    expect(s.notes.join(' ')).toContain('Nothing is set aside');
  });

  it('runway is savings measured against essentials, not total spend', () => {
    const s = summariseBudget(50_000, withAmounts({ rent: 10_000, aside: 30_000 }));
    expect(s.runwayMonths).toBe(3);
  });

  it('does not divide by zero when there are no essentials', () => {
    const s = summariseBudget(10_000, withAmounts({ aside: 5_000 }));
    expect(Number.isFinite(s.runwayMonths)).toBe(true);
    expect(s.runwayMonths).toBe(0);
  });

  it('handles zero income without NaN percentages', () => {
    const s = summariseBudget(0, withAmounts({ rent: 100 }));
    expect(Object.values(s.sharePct).every(Number.isFinite)).toBe(true);
  });

  it('ignores negative amounts rather than crediting them', () => {
    const s = summariseBudget(10_000, withAmounts({ rent: -5_000 }));
    expect(s.byBucket.needs).toBe(0);
  });
});

describe('bank statement', () => {
  it('the running balance ends where the summary says it does', () => {
    const bal = runningBalance(STATEMENT);
    expect(bal[bal.length - 1]).toBe(summarise(STATEMENT).closing);
  });

  it('closing equals opening plus in minus out', () => {
    const s = summarise(STATEMENT);
    expect(s.closing).toBe(OPENING_BALANCE + s.moneyIn - s.moneyOut);
  });

  it('never goes overdrawn, so the fictional month stays plausible', () => {
    expect(Math.min(...runningBalance(STATEMENT))).toBeGreaterThan(0);
  });

  it('has charges worth finding, and they are all outgoing', () => {
    const s = summarise(STATEMENT);
    expect(s.sneakyCount).toBeGreaterThanOrEqual(4);
    expect(s.sneakyTotal).toBeGreaterThan(0);
    for (const t of STATEMENT.filter((x) => x.sneaky)) expect(t.amount).toBeLessThan(0);
  });

  it('detects repeats and totals them', () => {
    const coffee = summarise(STATEMENT).recurring.find((r) => r.desc === 'Coffee');
    expect(coffee?.times).toBe(3);
    expect(coffee?.total).toBe(780);
  });

  it('the transfer to the cousin nets to zero once returned', () => {
    expect(summarise(STATEMENT).byCategory.transfer).toBe(-2_000); // the ATM cash
  });
});
