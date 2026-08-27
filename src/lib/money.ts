/* Indian digit grouping + loan math. Ported from visual-direction.html. */

/** Rs 3,00,000 — lakh/crore grouping, not thousands. */
export function inr(n: number): string {
  if (!Number.isFinite(n)) return '₹—';
  const neg = n < 0;
  const rounded = Math.round(Math.abs(n));
  const s = String(rounded);
  let last = s.slice(-3);
  const rest = s.slice(0, -3);
  if (rest) last = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last;
  return (neg ? '-' : '') + '₹' + last;
}

/** Digits only, for places where the symbol is already in the label. */
export function inrPlain(n: number): string {
  return inr(n).replace('₹', '');
}

export interface LoanResult {
  /** Equated monthly instalment. */
  emi: number;
  /** Total of all instalments. */
  totalPaid: number;
  /** totalPaid - principal. */
  totalInterest: number;
  /** Principal as a share of totalPaid, 0-100. */
  principalPct: number;
  months: number;
}

/**
 * Standard reducing-balance EMI.
 *   E = P * r * (1+r)^n / ((1+r)^n - 1)
 * where r is the MONTHLY rate and n is the number of months.
 */
export function computeLoan(
  principal: number,
  annualRatePct: number,
  years: number,
): LoanResult {
  const months = Math.max(1, Math.round(years * 12));
  const r = annualRatePct / 1200;

  // A 0% loan still has instalments; the compound formula divides by zero there.
  const emi = r === 0
    ? principal / months
    : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  const totalPaid = emi * months;
  const totalInterest = totalPaid - principal;

  return {
    emi,
    totalPaid,
    totalInterest,
    principalPct: totalPaid > 0 ? (principal / totalPaid) * 100 : 100,
    months,
  };
}

/** Future value of a one-time amount compounded annually. */
export function compound(principal: number, annualRatePct: number, years: number): number {
  return principal * Math.pow(1 + annualRatePct / 100, years);
}

/** Future value of a fixed monthly contribution (SIP-style), compounded monthly. */
export function futureValueMonthly(
  monthly: number,
  annualRatePct: number,
  years: number,
): number {
  const r = annualRatePct / 1200;
  const n = Math.round(years * 12);
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

/** What a sum today is worth in today's money after inflation. */
export function realValue(amount: number, inflationPct: number, years: number): number {
  return amount / Math.pow(1 + inflationPct / 100, years);
}
