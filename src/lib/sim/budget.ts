/**
 * Budget simulator (Section 30). Free-play counterpart to Journey 3: there the
 * numbers are fixed to make one point, here you bring your own.
 *
 * Pure logic so the tests can drive it. Note it reports, never scolds -- a plan
 * that puts nothing aside gets told what that means, not that it is wrong.
 */

export type Bucket = 'needs' | 'wants' | 'savings';

export interface BudgetLine {
  id: string;
  label: string;
  bucket: Bucket;
  amount: number;
}

export const DEFAULT_LINES: BudgetLine[] = [
  { id: 'rent',      label: 'Rent / home',        bucket: 'needs',   amount: 0 },
  { id: 'food',      label: 'Food & groceries',   bucket: 'needs',   amount: 0 },
  { id: 'transport', label: 'Transport',          bucket: 'needs',   amount: 0 },
  { id: 'bills',     label: 'Phone & bills',      bucket: 'needs',   amount: 0 },
  { id: 'fun',       label: 'Going out & fun',    bucket: 'wants',   amount: 0 },
  { id: 'shopping',  label: 'Shopping',           bucket: 'wants',   amount: 0 },
  { id: 'subs',      label: 'Subscriptions',      bucket: 'wants',   amount: 0 },
  { id: 'aside',     label: 'Set aside',          bucket: 'savings', amount: 0 },
];

export interface BudgetSummary {
  allocated: number;
  remaining: number;
  byBucket: Record<Bucket, number>;
  /** Share of INCOME, not of what was allocated: unassigned money is real. */
  sharePct: Record<Bucket, number>;
  overspent: boolean;
  /** Months of essentials the savings line would cover if income stopped. */
  runwayMonths: number;
  notes: string[];
}

export function summariseBudget(income: number, lines: BudgetLine[]): BudgetSummary {
  const byBucket: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 };
  for (const l of lines) byBucket[l.bucket] += Math.max(0, l.amount);

  const allocated = byBucket.needs + byBucket.wants + byBucket.savings;
  const remaining = income - allocated;
  const pct = (n: number) => (income > 0 ? Math.round((n / income) * 100) : 0);
  const sharePct = { needs: pct(byBucket.needs), wants: pct(byBucket.wants), savings: pct(byBucket.savings) };

  const notes: string[] = [];
  if (allocated > income) {
    notes.push(`This plan spends ₹${(allocated - income).toLocaleString('en-IN')} more than comes in.`);
  } else if (remaining > 0) {
    notes.push(`₹${remaining.toLocaleString('en-IN')} has no job yet. Unassigned money tends to get spent.`);
  }
  if (byBucket.savings === 0 && income > 0) {
    notes.push('Nothing is set aside, so any surprise has to come out of a category meant for something else.');
  }
  if (sharePct.wants > 40) {
    notes.push(`Wants are ${sharePct.wants}% of income — workable, but it leaves less room when something breaks.`);
  }

  // Runway answers "how long could I go if income stopped", which is the
  // question an emergency fund actually exists to answer.
  const monthlyEssentials = byBucket.needs;
  const runwayMonths = monthlyEssentials > 0 ? byBucket.savings / monthlyEssentials : 0;

  return { allocated, remaining, byBucket, sharePct, overspent: allocated > income, runwayMonths, notes };
}
