import type { Experience, ScreenCopy } from '../types';

export interface CompoundCurveParams {
  principal: number;
  rate: { min: number; max: number; step: number; default: number };
  startAge: { min: number; max: number; step: number; default: number };
  untilAge: number;
  inflation: number;
  /**
   * The Decide comparison. Deliberately built so the person who starts LATER
   * contributes twice as much every month and still finishes behind -- the
   * old version compared two people paying the same amount, where "the one
   * who started earlier has more" is obvious from reading the question.
   */
  race: {
    early: { name: string; monthly: number; startAge: number };
    late:  { name: string; monthly: number; startAge: number };
    rate: number;
  };
}

/** Numbers already fixed in the spec; slider covers the whole age range,
 *  so one shared script serves all three bands. */
const params: CompoundCurveParams = {
  principal: 100_000,
  rate: { min: 4, max: 14, step: 0.5, default: 8 },
  startAge: { min: 15, max: 40, step: 1, default: 18 },
  untilAge: 60,
  inflation: 6,
  race: {
    early: { name: 'Priya', monthly: 5_000,  startAge: 20 },
    late:  { name: 'Rahul', monthly: 10_000, startAge: 30 },
    rate: 10,
  },
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You have ₹1,00,000. What if you just... let it sit and grow?',
    lines: [
      { text: 'No more contributions. No touching it. Just time.' },
      { text: 'How big does that actually get?', accent: true },
    ],
    cta: "Let's watch",
  },
  explain: {
    kicker: 'Growth on growth',
    headline: 'Money that grows also grows the growth itself.',
    body: [
      'Each year you earn a return not just on your original ₹1,00,000, but on **every year of growth before it**.',
      'That effect is small at first and enormous later — which makes the starting point matter more than people expect.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: '₹1,00,000, left alone',
    headline: 'Move the rate. Move the starting age. Watch the curve.',
    labels: {
      rate: 'Return rate', startAge: 'Start age',
      finalLabel: 'By age {{untilAge}}', realLabel: 'What that’s worth today',
    },
    cta: 'I see it',
    lockedCta: 'Move a slider',
  },
  decide: {
    kicker: 'Your call',
    headline: 'Two people invest until 60. One puts in twice as much every month. Who ends up ahead?',
    body: [
      '**{{earlyName}}** starts at {{earlyStart}} and invests **{{earlyMonthly}} a month**.',
      '**{{lateName}}** starts at {{lateStart}} and invests **{{lateMonthly}} a month** — double.',
      'Both earn about {{raceRate}} a year.',
    ],
    options: [
      { id: 'early', title: '{{earlyName}} ends up with more', subtitle: 'Started at {{earlyStart}}, half the monthly amount', figure: 'puts in {{earlyPaid}} total' },
      { id: 'late',  title: '{{lateName}} ends up with more',  subtitle: 'Started at {{lateStart}}, double the monthly amount', figure: 'puts in {{latePaid}} total' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what actually wins",
    verdicts: {
      early: {
        tone: 'good',
        title: '{{earlyName}} wins — by {{raceGap}}.',
        lines: [
          '{{earlyName}} put in {{earlyPaid}} and ends with **{{earlyFv}}**.',
          '{{lateName}} put in {{latePaid}} and ends with **{{lateFv}}**.',
        ],
        body:
          '{{lateName}} invested **{{extraPaid}} more of their own money** and still finished **{{raceGap}} behind**. The ten years {{earlyName}} had at the start were worth more than doubling the monthly amount later — because that early money had the longest time to compound on itself.',
      },
      late: {
        tone: 'cost',
        title: 'Reasonable guess. It is wrong, and the gap is enormous.',
        lines: [
          '{{earlyName}} put in {{earlyPaid}} and ends with **{{earlyFv}}**.',
          '{{lateName}} put in {{latePaid}} and ends with **{{lateFv}}**.',
        ],
        body:
          '{{lateName}} invested **{{extraPaid}} more** and still finished **{{raceGap}} behind**. Doubling what you put in later does not catch up with a decade of compounding — the early money keeps earning on everything it already earned.',
      },
    },
    myth: {
      struck: 'Starting later but bigger catches up.',
      correction:
        'Doubling the monthly amount did not catch up with ten extra years. The years you skip are the one thing **no amount of money later can buy back**.',
    },
    vocab: {
      term: 'Compounding',
      definition:
        'Earning growth on your growth, not just on what you originally put in. It starts small and accelerates — the earlier it begins, the more years it has to snowball.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your cousin is 22 and says: "I will start investing properly once I earn more — probably around 30. I will just put in a bigger amount then to make up for it."',
    options: [
      { id: 'works', title: 'That works — a bigger amount later evens it out', correct: false,
        rationale: 'You just watched it not even out. Doubling the monthly amount from 30 still finished far behind starting small at 20.' },
      { id: 'start-small', title: 'Starting small now beats a bigger amount at 30', correct: true,
        rationale: 'Exactly. The eight years between 22 and 30 are the years with the most time left to compound, so they are the most valuable ones he has — and the only ones he cannot get back.' },
      { id: 'no-difference', title: 'It makes little difference either way at his age', correct: false,
        rationale: 'It makes the biggest difference at his age. The earliest rupees compound for the longest, so they do the heaviest lifting of anything he will ever invest.' },
    ],
    cta: 'Check answer',
  },
};

export const J07_MATH: Experience = {
  id: 'e07',
  journeyId: 'j07',
  slug: 'watch-10000-grow',
  title: 'Watch ₹10,000 Grow',
  mechanicType: 'compound-curve',
  isCore: true,
  timeSensitive: true,
  concepts: ['compounding', 'simple-vs-compound', 'inflation', 'time-value'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params as unknown as Record<string, unknown>, copy },
    '15-16': { params: params as unknown as Record<string, unknown>, copy },
    '17-18': { params: params as unknown as Record<string, unknown>, copy },
  },
};
