import type { Journey } from './types';

/**
 * Fixed order (Section 4). The order is pedagogically load-bearing:
 * Credit (6) must come before Math (7) — a student needs to have felt
 * compound interest cost them money before they will care about it
 * working for them. Do not reorder.
 *
 * Eleven segments, seven denomination colours, so colours repeat.
 */
export const JOURNEYS: Journey[] = [
  { id: 'j01', slug: 'inflation',        orderIndex: 1,  colorToken: 'n10',   estimatedMinutes: 4,
    title: 'Inflation',                      shortTitle: 'Inflation' },
  { id: 'j02', slug: 'credit-score',     orderIndex: 2,  colorToken: 'n20',   estimatedMinutes: 4,
    title: 'Credit Score',                   shortTitle: 'Credit Score' },
  { id: 'j03', slug: 'budgeting',        orderIndex: 3,  colorToken: 'n50',   estimatedMinutes: 4,
    title: 'Budgeting & Cash-Flow',          shortTitle: 'Budgeting' },
  { id: 'j04', slug: 'investments',      orderIndex: 4,  colorToken: 'n100',  estimatedMinutes: 4,
    title: 'Investments',                    shortTitle: 'Investments' },
  { id: 'j05', slug: 'banking',          orderIndex: 5,  colorToken: 'n200',  estimatedMinutes: 4,
    title: 'Banking',                        shortTitle: 'Banking' },
  { id: 'j06', slug: 'credit-debt',      orderIndex: 6,  colorToken: 'n2000', estimatedMinutes: 4,
    title: 'Credit, Loans & Debt',           shortTitle: 'Credit & Debt' },
  { id: 'j07', slug: 'money-math',       orderIndex: 7,  colorToken: 'n500',  estimatedMinutes: 4,
    title: 'The Math Behind Money',          shortTitle: 'Money Math' },
  { id: 'j08', slug: 'investing-basics', orderIndex: 8,  colorToken: 'n10',   estimatedMinutes: 4,
    title: 'Investing Basics',               shortTitle: 'Investing' },
  { id: 'j09', slug: 'destinations',     orderIndex: 9,  colorToken: 'n50',   estimatedMinutes: 4,
    title: 'Where Can Your Money Actually Go?', shortTitle: 'Destinations' },
  { id: 'j10', slug: 'planning',         orderIndex: 10, colorToken: 'n100',  estimatedMinutes: 4,
    title: 'Planning Your Money Life',       shortTitle: 'Planning' },
  { id: 'j11', slug: 'final-challenge',  orderIndex: 11, colorToken: 'n200',  estimatedMinutes: 4,
    title: "Run a Financial Life",              shortTitle: 'Final' },
];

export const JOURNEY_BY_SLUG = new Map(JOURNEYS.map((j) => [j.slug, j]));
export const JOURNEY_BY_ID = new Map(JOURNEYS.map((j) => [j.id, j]));

export function journeyColorVar(j: Journey): string {
  return `var(--${j.colorToken})`;
}

export function nextJourney(slug: string): Journey | undefined {
  const cur = JOURNEY_BY_SLUG.get(slug);
  if (!cur) return undefined;
  return JOURNEYS.find((j) => j.orderIndex === cur.orderIndex + 1);
}

export const TOTAL_JOURNEYS = JOURNEYS.length;
export const TOTAL_MINUTES = JOURNEYS.reduce((a, j) => a + j.estimatedMinutes, 0);
