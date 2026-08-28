import { describe, it, expect } from 'vitest';
import { inr, computeLoan, compound, futureValueMonthly, realValue } from '@/lib/money';

describe('inr — Indian digit grouping', () => {
  it('groups in lakhs, not thousands', () => {
    expect(inr(100000)).toBe('₹1,00,000');
    expect(inr(1000000)).toBe('₹10,00,000');
  });
  it('handles small numbers and zero', () => {
    expect(inr(0)).toBe('₹0');
    expect(inr(999)).toBe('₹999');
    expect(inr(1000)).toBe('₹1,000');
  });
  it('handles negatives and non-finite input without crashing', () => {
    expect(inr(-500)).toBe('-₹500');
    expect(inr(NaN)).toBe('₹—');
    expect(inr(Infinity)).toBe('₹—');
  });
});

describe('computeLoan', () => {
  it('matches the figures the homepage teaser publishes', () => {
    // These exact numbers are shown to visitors, so a change here is a
    // change to a public claim and should fail loudly.
    const short = computeLoan(100_000, 12, 2);
    const long = computeLoan(100_000, 12, 5);
    expect(Math.round(short.emi)).toBe(4707);
    expect(Math.round(long.emi)).toBe(2224);
    expect(Math.round(short.totalPaid)).toBe(112976);
    expect(Math.round(long.totalPaid)).toBe(133467);
  });

  it('states a difference that equals the subtraction shown on screen', () => {
    // The homepage prints both totals and then their difference. A student who
    // subtracts them must get the stated number -- this is the rounding bug
    // that shipped once and must not return.
    const short = computeLoan(100_000, 12, 2);
    const long = computeLoan(100_000, 12, 5);
    const displayedDiff = Math.round(long.totalPaid) - Math.round(short.totalPaid);
    expect(displayedDiff).toBe(20491);
  });

  it('a longer tenure lowers the EMI and raises the total — the core lesson', () => {
    const a = computeLoan(300_000, 11, 3);
    const b = computeLoan(300_000, 11, 7);
    expect(b.emi).toBeLessThan(a.emi);
    expect(b.totalInterest).toBeGreaterThan(a.totalInterest);
  });

  it('does not divide by zero at 0% interest', () => {
    const l = computeLoan(120_000, 0, 1);
    expect(Math.round(l.emi)).toBe(10000);
    expect(Math.round(l.totalInterest)).toBe(0);
  });
});

describe('compound / inflation', () => {
  it('compounds annually', () => {
    expect(Math.round(compound(10_000, 10, 1))).toBe(11000);
    expect(Math.round(compound(10_000, 10, 2))).toBe(12100);
  });
  it('matches Journey 1 figures shown to students', () => {
    expect(Math.round(compound(800, 8, 12))).toBe(2015);
    expect(Math.round(compound(15_000, 10, 12))).toBe(47076);
  });
  it('starting earlier beats a better rate started later — J7 premise', () => {
    const earlier = compound(10_000, 8, 42);   // start at 18, run to 60
    const betterRate = compound(10_000, 10, 32); // start at 28, run to 60
    expect(earlier).toBeGreaterThan(betterRate);
  });
  it('realValue shrinks money over time', () => {
    expect(realValue(100, 6, 10)).toBeLessThan(100);
    expect(Math.round(realValue(100, 6, 10))).toBe(56);
  });
  it('futureValueMonthly handles a 0% rate without NaN', () => {
    expect(futureValueMonthly(1000, 0, 1)).toBe(12000);
  });
});
