import { computeLoan, inr } from './money';
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
