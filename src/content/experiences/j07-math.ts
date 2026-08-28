import type { Experience, ScreenCopy } from '../types';

export interface CompoundCurveParams {
  principal: number;
  rate: { min: number; max: number; step: number; default: number };
  startAge: { min: number; max: number; step: number; default: number };
  untilAge: number;
  inflation: number;
}

/** Numbers already fixed in the spec; slider covers the whole age range,
 *  so one shared script serves all three bands. */
const params: CompoundCurveParams = {
  principal: 10_000,
  rate: { min: 4, max: 14, step: 0.5, default: 8 },
  startAge: { min: 15, max: 40, step: 1, default: 18 },
  untilAge: 60,
  inflation: 6,
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You have ₹10,000. What if you just... let it sit and grow?',
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
      'Each year you earn a return not just on your original ₹10,000, but on **every year of growth before it**.',
      'That effect is small at first and enormous later — which makes the starting point matter more than people expect.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: '₹10,000, left alone',
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
    headline: 'You can only pull one lever. Which matters more for ₹10,000 — starting earlier, or a better rate?',
    options: [
      { id: 'earlier', title: 'Start at {{earlyAge}} instead of {{baseAge}}', subtitle: 'Same {{rate}} rate, 10 years earlier', figure: '{{fvEarlier}} by {{untilAge}}' },
      { id: 'better-rate', title: 'Find {{betterRate}} instead of {{rate}}', subtitle: 'Same start age, a better return', figure: '{{fvBetterRate}} by {{untilAge}}' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what actually wins",
    verdicts: {
      earlier: {
        tone: 'good',
        title: 'Starting earlier wins, and it isn’t close.',
        body:
          'Ten extra years at {{rate}} gets you to **{{fvEarlier}}**. Chasing a {{betterRate}} return instead — same start age — only reaches **{{fvBetterRate}}**. Time did more work than the rate.',
      },
      'better-rate': {
        tone: 'cost',
        title: 'A better rate helps. Extra time helps more.',
        body:
          'That {{betterRate}} return gets you to **{{fvBetterRate}}**. Starting ten years earlier at the ordinary {{rate}} rate would have reached **{{fvEarlier}}** — no better return required, just an earlier start.',
      },
    },
    myth: {
      struck: 'Starting later but bigger catches up.',
      correction:
        'A bigger contribution later rarely beats an earlier start — the missing years of compounding are the one thing **no rate can buy back**.',
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
      'Two friends each invest ₹5,000 at 8% and never add another rupee. One starts at 20. The other starts at 30. Both let it sit until they’re 60.',
    options: [
      { id: 'same', title: 'They end up with about the same amount', correct: false,
        rationale: 'Ten extra years of compounding is a large gap at 8% — nowhere close to the same.' },
      { id: 'earlier-more', title: 'The one who started at 20 ends up with meaningfully more', correct: true,
        rationale: 'Right. Same amount, same rate, same effort — the only difference is ten extra years for the growth to compound on itself.' },
      { id: 'later-more', title: 'The one who started at 30 ends up with more', correct: false,
        rationale: 'Starting later only helps if you contribute more or find a better rate. Neither happened here — only time changed, and time was on the other friend’s side.' },
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
