import { computeLoan, inr } from './money';
import type { AllocateParams } from '@/content/experiences/j03-budgeting';
import type { EmiParams } from '@/content/experiences/j06-credit';

/** Replaces {{token}} in content copy. Unknown tokens are left visible on
 *  purpose so a typo in the CMS shows up instead of silently rendering blank. */
export function resolveTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, key: string) =>
    key in tokens ? tokens[key] : whole,
  );
}

/**
 * Derived figures for the emi-slider mechanic.
 * Uses the DEFAULT amount and rate, not the student's slider position —
 * the Decide screen says "Same bike. Same Rs 3,00,000", so the two loans
 * being compared must hold everything constant except tenure.
 */
export function emiTokens(p: EmiParams): Record<string, string> {
  const amount = p.amount.default;
  const rate = p.rate.default;

  const a = computeLoan(amount, rate, p.optionA.years);
  const b = computeLoan(amount, rate, p.optionB.years);

  return {
    amount: inr(amount),
    rate: `${rate}%`,
    emiA: inr(a.emi),
    emiB: inr(b.emi),
    interestA: inr(a.totalInterest),
    interestB: inr(b.totalInterest),
    totalA: inr(a.totalPaid),
    totalB: inr(b.totalPaid),
    difference: inr(b.totalInterest - a.totalInterest),
    emiDifference: inr(a.emi - b.emi),
    yearsA: String(p.optionA.years),
    yearsB: String(p.optionB.years),
  };
}

/**
 * Derived figures for the allocate-events mechanic.
 *
 * `dayRanOut` is computed by walking the events in date order and spending
 * the month's slack against them, rather than being written into the copy.
 * If an author retunes the pool or the events, the Feedback screen follows
 * automatically instead of quietly stating a day that is no longer true.
 */
export function allocateTokens(p: AllocateParams): Record<string, string> {
  const eventsTotal = p.events.reduce((sum, e) => sum + e.amount, 0);
  const setAside = p.categories
    .filter((c) => c.id === 'aside')
    .reduce((sum, c) => sum + c.suggested, 0);
  const essentials = p.categories
    .filter((c) => c.essential)
    .reduce((sum, c) => sum + c.suggested, 0);

  // The head-tracking path: only the "set aside" pot absorbs surprises.
  // Walk events in date order and find where it runs dry.
  let slack = setAside;
  let dayRanOut = 0;
  for (const e of [...p.events].sort((x, y) => x.day - y.day)) {
    slack -= e.amount;
    if (slack < 0 && dayRanOut === 0) dayRanOut = e.day;
  }
  const shortfall = Math.max(0, eventsTotal - setAside);

  return {
    pool: inr(p.pool),
    buffer: inr(p.bufferTarget),
    spendable: inr(p.pool - p.bufferTarget),
    setAside: inr(setAside),
    essentials: inr(essentials),
    wants: inr(p.pool - essentials - setAside),
    eventsTotal: inr(eventsTotal),
    shortfall: inr(shortfall),
    bufferGap: inr(Math.max(0, eventsTotal - p.bufferTarget)),
    dayRanOut: String(dayRanOut || p.events[p.events.length - 1].day),
    month: p.month,
  };
}
