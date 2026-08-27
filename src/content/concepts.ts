import type { Concept } from './types';

/**
 * Section 8: only `isCoreConcept` gets the 5-state mastery machine.
 * Target is roughly 25-30 core concepts — everything else is
 * complete/incomplete. Diluting this list dilutes what "mastered" means.
 */
export const CONCEPTS: Concept[] = [
  // Mindset
  { slug: 'opportunity-cost',    title: 'Opportunity cost',              isCoreConcept: true },
  { slug: 'delayed-gratification', title: 'Delayed gratification',       isCoreConcept: true },
  { slug: 'needs-vs-wants',      title: 'Needs vs wants',                isCoreConcept: true },
  // Earning
  { slug: 'active-income',       title: 'Active income',                 isCoreConcept: true },
  { slug: 'passive-income',      title: 'Passive income',                isCoreConcept: true },
  { slug: 'gross-vs-net',        title: 'Gross vs net pay',              isCoreConcept: false },
  // Budgeting
  { slug: 'budgeting',           title: 'Budgeting',                     isCoreConcept: true },
  { slug: 'cash-flow',           title: 'Cash flow',                     isCoreConcept: true },
  { slug: 'fixed-vs-variable',   title: 'Fixed vs variable costs',       isCoreConcept: false },
  // Banking
  { slug: 'how-banks-work',      title: 'How banks actually work',       isCoreConcept: true },
  { slug: 'upi-safety',          title: 'UPI and payment safety',        isCoreConcept: true },
  { slug: 'account-types',       title: 'Account types',                 isCoreConcept: false },
  // Saving
  { slug: 'emergency-fund',      title: 'Emergency fund',                isCoreConcept: true },
  { slug: 'saving-vs-investing', title: 'Saving vs investing',           isCoreConcept: true },
  // Credit
  { slug: 'principal',           title: 'Principal',                     isCoreConcept: true },
  { slug: 'interest',            title: 'Interest',                      isCoreConcept: true },
  { slug: 'emi-true-cost',       title: 'What an EMI really costs',      isCoreConcept: true },
  { slug: 'loan-tenure',         title: 'Loan tenure',                   isCoreConcept: true },
  { slug: 'credit-score',        title: 'Credit score',                  isCoreConcept: true },
  { slug: 'minimum-payment-trap', title: 'The minimum payment trap',     isCoreConcept: true },
  // Math
  { slug: 'compounding',         title: 'Compounding',                   isCoreConcept: true },
  { slug: 'simple-vs-compound',  title: 'Simple vs compound interest',   isCoreConcept: true },
  { slug: 'inflation',           title: 'Inflation',                     isCoreConcept: true },
  { slug: 'time-value',          title: 'Time value of money',           isCoreConcept: true },
  // Investing
  { slug: 'risk-return',         title: 'Risk and return',               isCoreConcept: true },
  { slug: 'diversification',     title: 'Diversification',               isCoreConcept: true },
  { slug: 'volatility',          title: 'Volatility',                    isCoreConcept: false },
  { slug: 'sip',                 title: 'Systematic investing',          isCoreConcept: false },
  // Destinations
  { slug: 'liquidity',           title: 'Liquidity',                     isCoreConcept: true },
  { slug: 'time-horizon',        title: 'Matching money to time horizon', isCoreConcept: true },
  // Planning
  { slug: 'goal-setting',        title: 'Financial goal setting',        isCoreConcept: true },
  { slug: 'net-worth',           title: 'Net worth',                     isCoreConcept: true },
  // Scams
  { slug: 'scam-red-flags',      title: 'Scam red flags',                isCoreConcept: true },
  { slug: 'guaranteed-returns',  title: 'The "guaranteed returns" lie',  isCoreConcept: true },
  { slug: 'phishing-otp',        title: 'OTP and phishing fraud',        isCoreConcept: true },
];

export const CONCEPT_BY_SLUG = new Map(CONCEPTS.map((c) => [c.slug, c]));
export const CORE_CONCEPTS = CONCEPTS.filter((c) => c.isCoreConcept);

export function isCoreConcept(slug: string): boolean {
  return CONCEPT_BY_SLUG.get(slug)?.isCoreConcept ?? false;
}
