import type { Experience, ScreenCopy } from '../types';

/**
 * REFERENCE IMPLEMENTATION + TEST FIXTURE (Section 6).
 * Copy is verbatim from visual-direction.html screens 01-06.
 *
 * One deliberate change: every rupee figure in the Feedback copy is a
 * {{token}} resolved from the live loan math rather than a literal.
 * The literals in visual-direction.html (Rs 1,31,424 / Rs 53,592 /
 * Rs 77,832) were hand-written into the markup and are each off by a
 * few hundred rupees from what that same file's own EMI formula
 * returns. Sentences are unchanged; only the numbers are now computed.
 * Section 23: a finance product does not ship arithmetic it knows is wrong.
 */

export interface EmiParams {
  amount: { min: number; max: number; step: number; default: number };
  rate: { min: number; max: number; step: number; default: number };
  years: { min: number; max: number; step: number; default: number };
  /** The two loans offered on the Decide screen. */
  optionA: { years: number; label: string };
  optionB: { years: number; label: string };
  lender: string;
  asset: string;
}

const params1516: EmiParams = {
  amount: { min: 50_000, max: 500_000, step: 10_000, default: 300_000 },
  rate:   { min: 8, max: 18, step: 0.5, default: 11 },
  years:  { min: 1, max: 7, step: 1, default: 7 },
  optionA: { years: 3, label: 'Loan A — 3 years' },
  optionB: { years: 7, label: 'Loan B — 7 years' },
  lender: 'BlueBank',
  asset: 'Bike loan',
};

const copy1516: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Two people borrow ₹3,00,000 for a bike.',
    lines: [
      { text: 'One pays ₹9,000 a month. The other pays ₹5,600 a month.' },
      { text: 'Who got the better deal?', accent: true },
    ],
    cta: 'Make a guess',
  },

  explain: {
    kicker: 'How borrowing works',
    headline: 'You borrow money now. You give back more later.',
    body: [
      "The extra is called **interest** — the price of using someone else's money.",
      'How much extra depends on three things: how much you borrow, the rate, and **how long you take to repay**.',
    ],
    cta: 'Try it yourself',
  },

  interact: {
    kicker: 'Bike loan · BlueBank',
    headline: 'Drag the years.',
    labels: {
      amount: 'Loan amount',
      rate: 'Interest rate',
      years: 'Repay over',
      emi: 'You pay each month',
      principalLegend: 'What you borrowed',
      interestLegend: 'Extra you pay',
      interest: 'Extra you pay',
    },
    cta: 'I see it',
  },

  decide: {
    kicker: 'Your call',
    headline: 'Same bike. Same ₹3,00,000. Which loan do you take?',
    options: [
      { id: 'a', title: 'Loan A — 3 years', subtitle: 'Heavier every month, over sooner', figure: '{{emiA}} / month' },
      { id: 'b', title: 'Loan B — 7 years', subtitle: 'Easy monthly payment, runs longer', figure: '{{emiB}} / month' },
    ],
    cta: 'Lock it in',
  },

  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      b: {
        tone: 'cost',
        title: 'Loan B costs {{interestB}} extra',
        body: 'Loan A costs {{interestA}}. The smaller monthly payment cost you **{{difference}} more** — about a second bike.',
      },
      a: {
        tone: 'good',
        title: 'Loan A costs {{interestA}} extra',
        body: 'Loan B would have cost {{interestB}}. Paying **{{emiDifference}} more** each month saved you **{{difference}}** — about a second bike.',
      },
    },
    myth: {
      struck: 'A smaller EMI means a cheaper loan.',
      correction: 'A smaller EMI means a **longer** loan. Longer almost always means more.',
    },
    vocab: {
      term: 'EMI',
      definition:
        'Equated Monthly Instalment — the fixed amount you pay every month. It tells you what fits your month. It does not tell you what the loan costs.',
    },
    cta: 'Got it',
  },

  practice: {
    kicker: 'Quick check',
    prompt:
      "Your cousin is buying a laptop on EMI. The shop offers a 24-month plan at a lower monthly amount than the 12-month plan. She says it's cheaper.",
    options: [
      {
        id: 'right', title: "She's right", subtitle: 'Lower monthly payment, less money', correct: false,
        rationale: 'The monthly amount is lower, but she pays it 24 times instead of 12. Lower per month is not lower in total.',
      },
      {
        id: 'wrong', title: "She's wrong", subtitle: "She'll pay more in total", correct: true,
        rationale: 'Same laptop, twice as long to pay it off, so interest builds for twice as long. She pays more in total — exactly like Loan B.',
      },
      {
        id: 'unsure', title: "Can't tell yet", subtitle: 'Need to know the interest rate', correct: false,
        rationale:
          'Careful thinking — a much lower rate could in theory close the gap. But at the same rate, longer always costs more, and shops very rarely cut the rate on the longer plan.',
      },
    ],
    cta: 'Check answer',
  },
};

/* 17-18: same misconception, same interaction, adult framing and numbers. */
const params1718: EmiParams = {
  ...params1516,
  amount: { min: 100_000, max: 1_200_000, step: 25_000, default: 700_000 },
  years:  { min: 1, max: 7, step: 1, default: 7 },
  rate:   { min: 8, max: 16, step: 0.5, default: 10.5 },
  asset: 'Used car loan',
};

const copy1718: ScreenCopy = {
  ...copy1516,
  hook: {
    kicker: 'Before we start',
    headline: 'Two people borrow ₹7,00,000 for a used car.',
    lines: [
      { text: 'One pays ₹22,800 a month. The other pays ₹11,800 a month.' },
      { text: 'Who got the better deal?', accent: true },
    ],
    cta: 'Make a guess',
  },
  interact: { ...copy1516.interact, kicker: 'Used car loan · BlueBank' },
  decide: {
    ...copy1516.decide,
    headline: 'Same car. Same ₹7,00,000. Which loan do you take?',
    options: [
      { id: 'a', title: 'Loan A — 3 years', subtitle: 'Heavier every month, over sooner', figure: '{{emiA}} / month' },
      { id: 'b', title: 'Loan B — 7 years', subtitle: 'Easy monthly payment, runs longer', figure: '{{emiB}} / month' },
    ],
  },
  feedback: {
    ...copy1516.feedback,
    verdicts: {
      b: {
        tone: 'cost',
        title: 'Loan B costs {{interestB}} extra',
        body: 'Loan A costs {{interestA}}. The smaller monthly payment cost you **{{difference}} more** — most of another car.',
      },
      a: {
        tone: 'good',
        title: 'Loan A costs {{interestA}} extra',
        body: 'Loan B would have cost {{interestB}}. Paying **{{emiDifference}} more** each month saved you **{{difference}}**.',
      },
    },
  },
};

export const j06Credit: Experience = {
  id: 'e06',
  journeyId: 'j06',
  slug: 'what-does-this-loan-really-cost',
  title: 'What Does This Loan Really Cost?',
  mechanicType: 'emi-slider',
  isCore: true,
  concepts: ['principal', 'interest', 'emi-true-cost', 'loan-tenure'],

  /**
   * Section 6 gates Credit away from 12-14 unless a lighter cut exists.
   * Defaulting to 15+ until content authors confirm. To open it up, add
   * '12-14' here and supply a matching entry in ageVariants — the player
   * and the home screen already handle a three-band experience.
   */
  availableTo: ['15-16', '17-18'],

  ageVariants: {
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: copy1718 },
  },
};
