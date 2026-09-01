import {
  PLACEHOLDER_PREFIX as P,
  AGE_BANDS,
  type AgeBand,
  type Experience,
  type MechanicType,
  type ScreenCopy,
} from '../types';

/**
 * Section 6: the remaining ten experiences ship as structurally valid
 * placeholders — correct schema shape, correct screen count — so the
 * full 11-journey flow is testable end to end before real content lands.
 * Every copy string carries the [PLACEHOLDER] prefix so the CMS and the
 * player can both make it visually obvious that this is not final text.
 */

export interface Spec {
  id: string;
  journeyId: string;
  slug: string;
  title: string;
  mechanicType: MechanicType;
  concepts: string[];
  /** From the Section 5 table — the misconception this experience kills. */
  misconception: string;
  /** Plain-language summary of the interaction, for the author writing it. */
  mechanicNote: string;
  vocabTerm: string;
  availableTo?: AgeBand[];
  params?: Record<string, unknown>;
}

export function makeCopy(s: Spec): ScreenCopy {
  return {
    hook: {
      kicker: `${P} Before we start`,
      headline: `${P} ${s.title}`,
      lines: [
        { text: `${P} A scenario or number that makes the misconception feel true.` },
        { text: `${P} The question that hooks it.`, accent: true },
      ],
      cta: `${P} Make a guess`,
    },
    explain: {
      kicker: `${P} How it works`,
      headline: `${P} The minimum needed to attempt the interaction.`,
      body: [
        `${P} 20-40 words. No formal definition — the vocabulary card comes after the interaction, not before.`,
      ],
      cta: `${P} Try it yourself`,
    },
    interact: {
      kicker: `${P} ${s.title}`,
      headline: `${P} ${s.mechanicNote}`,
      cta: `${P} I see it`,
      lockedCta: LOCKED_CTA[s.mechanicType],
    },
    decide: {
      kicker: `${P} Your call`,
      headline: `${P} A committed choice with a visible consequence — not a quiz.`,
      options: [
        { id: 'a', title: `${P} Option A`, subtitle: `${P} The choice that looks obviously right.` },
        { id: 'b', title: `${P} Option B`, subtitle: `${P} The choice the misconception pushes you toward.` },
      ],
      cta: `${P} Lock it in`,
    },
    feedback: {
      kicker: `${P} Here's what happened`,
      verdicts: {
        a: { tone: 'good', title: `${P} What option A cost you`, body: `${P} The consequence, in numbers.` },
        b: { tone: 'cost', title: `${P} What option B cost you`, body: `${P} The consequence, in numbers.` },
      },
      myth: {
        struck: s.misconception,
        correction: `${P} What is actually true, in one sentence.`,
      },
      vocab: {
        term: s.vocabTerm,
        definition: `${P} One plain-English sentence. No jargon inside the definition.`,
      },
      cta: `${P} Got it`,
    },
    practice: {
      kicker: `${P} Quick check`,
      prompt: `${P} The same concept in a DIFFERENT context than the interaction above. Never reuse the interaction's own scenario — that tests memory, not transfer.`,
      options: [
        { id: 'o1', title: `${P} Wrong answer`, correct: false, rationale: `${P} Why this is wrong.` },
        { id: 'o2', title: `${P} Right answer`, correct: true, rationale: `${P} Why this is right.` },
        { id: 'o3', title: `${P} Tempting wrong answer`, correct: false, rationale: `${P} Why this is wrong.` },
      ],
      cta: `${P} Check answer`,
    },
  };
}

function build(s: Spec): Experience {
  const bands = s.availableTo ?? AGE_BANDS;
  const copy = makeCopy(s);
  return {
    id: s.id,
    journeyId: s.journeyId,
    slug: s.slug,
    title: s.title,
    mechanicType: s.mechanicType,
    isCore: true,
    concepts: s.concepts,
    availableTo: bands,
    ageVariants: Object.fromEntries(
      bands.map((b) => [b, { params: s.params ?? {}, copy }]),
    ),
  };
}

/**
 * The pre-engagement nudge, per mechanic. These are authored (not
 * [PLACEHOLDER]-prefixed) because the correct wording follows from the
 * interaction itself and is knowable before the copy is written — and a
 * student should never be told to "move a slider" on a drag-and-drop screen.
 */
const LOCKED_CTA: Record<MechanicType, string> = {
  'inflation-basket':   'Move the slider first',
  'credit-profiles':    'Make a prediction first',
  'find-problem':       'Check your answers first',
  'match-instrument':   'Match every instrument first',
  'bank-choice':        'Look at each bank first',
  'emi-slider':         'Try moving a slider',
  'compound-curve':     'Change something and watch',
  'allocate-portfolio': 'Fill all three, then run it twice',
  'match-goal':         'Match every goal',
  'goal-planner':       'Add a goal to begin',
  'final-challenge':    'Finish the year first',
};

const SPECS: Spec[] = [
  {
    id: 'e01', journeyId: 'j01', slug: 'buy-it-now-or-wait', title: 'Buy It Now, or Wait?',
    mechanicType: 'inflation-basket',
    concepts: ['opportunity-cost', 'delayed-gratification', 'needs-vs-wants'],
    misconception: 'Waiting means missing out.',
    mechanicNote: 'Choose spend-now or wait-and-grow, then fast-forward and see both.',
    vocabTerm: 'Opportunity cost',
  },
  {
    id: 'e02', journeyId: 'j02', slug: 'two-ways-to-get-paid', title: 'Two Ways to Get Paid',
    mechanicType: 'credit-profiles',
    concepts: ['active-income', 'passive-income'],
    misconception: 'Income is your job, full stop.',
    mechanicNote: 'Compare income that stops when you stop working against income that does not.',
    vocabTerm: 'Passive income',
  },
  {
    id: 'e03', journeyId: 'j03', slug: 'can-you-survive-the-month', title: 'Can You Survive the Month?',
    mechanicType: 'find-problem',
    concepts: ['budgeting', 'cash-flow', 'needs-vs-wants'],
    misconception: "I'll just track it in my head.",
    mechanicNote: 'Allocate a monthly amount, then random mid-month events hit.',
    vocabTerm: 'Cash flow',
    // Section 6: 12-14 allocates pocket money; 17-18 allocates a salary.
    params: { pool: { '12-14': 1_000, '15-16': 5_000, '17-18': 35_000 } },
  },
  {
    id: 'e04', journeyId: 'j04', slug: 'follow-the-500', title: 'Follow the ₹500',
    mechanicType: 'match-instrument',
    concepts: ['how-banks-work', 'upi-safety'],
    misconception: 'The bank just holds my money in a locker.',
    mechanicNote: 'Trace sender to UPI to bank to recipient, then meet a fake-OTP trap.',
    vocabTerm: 'UPI',
  },
  {
    id: 'e05', journeyId: 'j05', slug: 'the-rainy-day-test', title: 'The Rainy Day Test',
    mechanicType: 'bank-choice',
    concepts: ['emergency-fund', 'saving-vs-investing'],
    misconception: "I'll deal with it when it happens.",
    mechanicNote: 'Two identical students, one has an emergency fund, the same shock hits both.',
    vocabTerm: 'Emergency fund',
  },
  {
    id: 'e07', journeyId: 'j07', slug: 'watch-10000-grow', title: 'Watch ₹10,000 Grow',
    mechanicType: 'compound-curve',
    concepts: ['compounding', 'simple-vs-compound', 'inflation', 'time-value'],
    misconception: 'Starting later but bigger catches up.',
    mechanicNote: 'Compounding curve with a simple-vs-compound toggle, inflation overlay and a start-age slider.',
    vocabTerm: 'Compounding',
    params: {
      principal: 10_000,
      rate: { min: 4, max: 14, step: 0.5, default: 8 },
      startAge: { min: 15, max: 40, step: 1, default: 18 },
      untilAge: 60,
      inflation: { default: 6, timeSensitive: true },
    },
  },
  {
    id: 'e08', journeyId: 'j08', slug: 'pick-your-risk', title: 'Pick Your Risk',
    mechanicType: 'allocate-portfolio',
    concepts: ['risk-return', 'diversification', 'volatility'],
    misconception: 'Higher return means a better investment.',
    // Section 18: the simulation must run more than once, so that
    // "returns are uncertain" is demonstrated rather than merely stated.
    mechanicNote: 'Allocate three buckets, then run the same portfolio twice with different outcomes.',
    vocabTerm: 'Diversification',
    availableTo: ['15-16', '17-18'],
    params: { buckets: 3, runs: 2 },
  },
  {
    id: 'e09', journeyId: 'j09', slug: 'match-the-goal', title: 'Match the Goal',
    mechanicType: 'match-goal',
    concepts: ['liquidity', 'time-horizon', 'saving-vs-investing'],
    misconception: "There's one best place to put money.",
    mechanicNote: 'Drag goals (phone in 6 months, college in 5 years) onto appropriate instruments.',
    vocabTerm: 'Liquidity',
  },
  {
    id: 'e10', journeyId: 'j10', slug: 'your-money-map', title: 'Your Money Map',
    mechanicType: 'goal-planner',
    concepts: ['goal-setting', 'net-worth', 'time-horizon'],
    misconception: 'Goals are vague wishes.',
    mechanicNote: 'Enter three real goals and get the monthly saving each one needs.',
    vocabTerm: 'Net worth',
  },
  {
    id: 'e11', journeyId: 'j11', slug: 'spot-the-scam', title: 'Spot the Scam',
    mechanicType: 'final-challenge',
    concepts: ['scam-red-flags', 'guaranteed-returns', 'phishing-otp'],
    misconception: "Scams are obvious. That won't be me.",
    mechanicNote: 'Four fictional offers. Flag the red flags before the clock runs out.',
    vocabTerm: 'Red flag',
    params: { offers: 4, seconds: 45 },
  },
];

export const PLACEHOLDER_EXPERIENCES: Experience[] = SPECS.map(build);
