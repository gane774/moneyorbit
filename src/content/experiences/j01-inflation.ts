import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

/**
 * Journey 1 — Inflation. Replaces "Money Mindset".
 *
 * The visual language is a deliberate mirror of Journey 7: same slider-and-
 * readout shape, but the line falls instead of rising. Growth and erosion are
 * the same mechanism seen from two sides, and putting them in the same
 * component vocabulary is the point.
 *
 * Age progression: what is happening (12-14) -> why it happens (15-16) ->
 * how it changes a decision (17-18).
 */

export interface BasketItem { label: string; thenPrice: number; nowPrice: number }

export interface InflationParams {
  /** Drives which of the three interactions the component renders. */
  mode: 'basket' | 'purchasing-power' | 'real-return';
  /** basket mode */
  pocket?: number;
  yearsAgo?: number;
  items?: BasketItem[];
  /** purchasing-power mode */
  amount?: number;
  rate?: { min: number; max: number; step: number; default: number };
  years?: { min: number; max: number; step: number; default: number };
  /** real-return mode */
  instruments?: { label: string; nominal: number }[];
}

const params1214: InflationParams = {
  mode: 'basket',
  pocket: 100,
  yearsAgo: 5,
  items: [
    { label: 'Packet of chips',  thenPrice: 10, nowPrice: 20 },
    { label: 'Bus ticket',       thenPrice: 12, nowPrice: 20 },
    { label: 'Notebook',         thenPrice: 25, nowPrice: 40 },
    { label: 'Movie ticket',     thenPrice: 90, nowPrice: 180 },
  ],
};

const params1516: InflationParams = {
  mode: 'purchasing-power',
  amount: 10_000,
  rate:  { min: 2, max: 10, step: 0.5, default: 6 },
  years: { min: 1, max: 20, step: 1,   default: 5 },
};

const params1718: InflationParams = {
  mode: 'real-return',
  amount: 100_000,
  rate: { min: 2, max: 10, step: 0.5, default: 6 },
  years: { min: 1, max: 25, step: 1, default: 10 },
  instruments: [
    { label: 'Savings account', nominal: 3.5 },
    { label: 'Fixed deposit',   nominal: 7 },
    { label: 'Long-term equity (historical average)', nominal: 11 },
  ],
};

/* ---------------------------------------------------------------- 12-14 */
const copy1214: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Five years ago, ₹100 bought ten packets of chips.',
    lines: [
      { text: 'The chips did not change. The packet is the same size.' },
      { text: 'Today the same ₹100 buys five. Where did the other five go?', accent: true },
    ],
    cta: "Let's find out",
  },
  explain: {
    kicker: 'What is going on',
    headline: 'Prices creep up. Your money does not.',
    body: [
      'Almost everything costs a little more each year — snacks, bus tickets, notebooks, movie tickets.',
      'Your ₹100 note is still a ₹100 note. But **what it can buy keeps shrinking**. That slow rise in prices has a name, and you already understand it.',
    ],
    cta: 'See it happen',
  },
  interact: {
    kicker: 'Your ₹100',
    headline: 'Slide the years and watch what ₹100 buys.',
    labels: {
      then: 'Five years ago', now: 'Today',
      buys: 'What ₹100 buys', slider: 'Years',
    },
    cta: 'I see it',
    lockedCta: 'Move the slider first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'You have ₹500 saved for a game that costs ₹500 today. You could buy it now, or wait six months.',
    options: [
      { id: 'buy-now', title: 'Buy it now', subtitle: 'You have exactly enough today' },
      { id: 'wait',    title: 'Wait six months', subtitle: 'Keep the ₹500 and decide later' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's the thing",
    verdicts: {
      'buy-now': {
        tone: 'good',
        title: 'Sensible — and now you know why.',
        body:
          'Your ₹500 is worth the most **right now**. In six months the game may cost ₹520 or ₹540, and your ₹500 would no longer be enough. Waiting does not make money grow on its own.',
      },
      wait: {
        tone: 'cost',
        title: 'Careful — waiting is not free.',
        body:
          'Money kept in a drawer does not grow, but prices keep moving. In six months the game may cost ₹520 and your ₹500 will not stretch to it. **Waiting costs you something too**, even when it does not feel like it.',
      },
    },
    myth: {
      struck: 'If I do not spend my money, it stays the same.',
      correction:
        'The **number** stays the same. What it can **buy** keeps shrinking, quietly, every single year.',
    },
    vocab: {
      term: 'Inflation',
      definition:
        'The slow rise in prices over time. It is why your parents talk about things being cheaper "back then" — they are not imagining it.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your cousin has ₹200 in a piggy bank. He is saving it for three years to buy something bigger. He says: "In three years I will still have ₹200, so nothing is lost."',
    options: [
      { id: 'right', title: 'He is right — ₹200 is still ₹200', correct: false,
        rationale: 'The note is still ₹200. But whatever he wants will probably cost more in three years, so that same ₹200 buys less of it.' },
      { id: 'buys-less', title: 'He will still have ₹200, but it will buy less', correct: true,
        rationale: 'Exactly. Nothing is stolen from the piggy bank — prices simply move up around it, so the same money stretches less far.' },
      { id: 'less-money', title: 'He will have less than ₹200 in three years', correct: false,
        rationale: 'The amount does not shrink. What changes is what that amount can buy — that is the part that is easy to miss.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 15-16 */
const copy1516: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You saved ₹10,000 for a phone. You left it untouched for five years.',
    lines: [
      { text: 'It is still exactly ₹10,000. You did not spend a rupee of it.' },
      { text: 'So why can you no longer afford the phone?', accent: true },
    ],
    cta: "Let's look",
  },
  explain: {
    kicker: 'Putting a number on it',
    headline: 'Prices do not just rise. They rise at a rate.',
    body: [
      'In India that rate has usually sat somewhere around **6% a year**. That means something costing ₹100 this year tends to cost about ₹106 next year.',
      'It sounds small. Over five or ten years it is not — because each year’s rise stacks on the one before it, the same way compounding works in your favour when you invest.',
    ],
    cta: 'Try the numbers',
  },
  interact: {
    kicker: '₹10,000, untouched',
    headline: 'Set the rate and the years. Watch what it can still buy.',
    labels: {
      rate: 'Inflation rate', years: 'Years untouched',
      nominal: 'Still in your account', real: 'What it can actually buy',
      lost: 'Quietly lost',
    },
    cta: 'I see it',
    lockedCta: 'Move a slider first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'You have ₹10,000 you will not need for three years. Inflation is running at about 6%.',
    body: ['Neither option is exciting. One of them loses you less.'],
    options: [
      { id: 'cash',    title: 'Keep it as cash at home', subtitle: 'Completely safe, earns nothing', figure: '0% a year' },
      { id: 'savings', title: 'Put it in a savings account', subtitle: 'Safe, earns a little', figure: 'about 3.5% a year' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what actually happens",
    verdicts: {
      cash: {
        tone: 'cost',
        title: 'The safest place to lose the most.',
        body:
          'Cash earns 0% while prices rise about 6%. After three years the note is untouched, but it buys roughly **16% less** than it did. "Safe" protected the number, not the value.',
      },
      savings: {
        tone: 'good',
        title: 'Better — though still going backwards.',
        body:
          'Earning about 3.5% against 6% inflation means you are still losing roughly **2.5% a year** in what your money can buy. It is the smaller loss, not a gain. That gap is exactly why people invest rather than only save.',
      },
    },
    myth: {
      struck: 'A savings account protects my money.',
      correction:
        'It **slows the loss**. When the interest rate is below inflation, a savings account is still going backwards — just more slowly than cash under a mattress.',
    },
    vocab: {
      term: 'Purchasing power',
      definition:
        'What your money can actually buy, rather than the number printed on it. Inflation attacks purchasing power while leaving the number completely untouched.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'A fixed deposit pays 5% a year. Inflation that year runs at 6%. Your friend says: "I made 5%, so I am ahead."',
    options: [
      { id: 'ahead', title: 'He is ahead — 5% is a gain', correct: false,
        rationale: 'He earned 5% more rupees, but everything he wants to buy got about 6% more expensive. More rupees, less stuff.' },
      { id: 'behind', title: 'He went slightly backwards', correct: true,
        rationale: 'Right. Earning 5% while prices rise 6% leaves him roughly 1% worse off in what he can actually buy — even though his balance went up.' },
      { id: 'even', title: 'He broke even', correct: false,
        rationale: 'Close, but not quite. Breaking even needs the return to match inflation exactly; 5% against 6% is a small real loss.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 17-18 */
const copy1718: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Your fixed deposit pays 7%. Inflation is running at 6%.',
    lines: [
      { text: 'Your statement shows a gain. Your balance genuinely went up.' },
      { text: 'How much did you actually make?', accent: true },
    ],
    cta: 'Work it out',
  },
  explain: {
    kicker: 'Two different returns',
    headline: 'The rate you are quoted is not the rate you get.',
    body: [
      'The number a bank advertises is the **nominal** return — the growth in rupees. It ignores what those rupees can buy.',
      'Subtract inflation and you get the **real** return: what you actually gained in purchasing power. A 7% return against 6% inflation is roughly **1% real** — technically a gain, and nothing like 7%.',
    ],
    cta: 'Compare them',
  },
  interact: {
    kicker: 'Nominal against real',
    headline: 'Move inflation. Watch which of these actually stay ahead.',
    labels: {
      rate: 'Inflation rate', years: 'Over',
      nominal: 'Nominal return', real: 'Real return',
      value: 'What ₹1,00,000 becomes', worth: "What that's worth in today's money",
    },
    cta: 'I see it',
    lockedCta: 'Move the inflation slider',
  },
  decide: {
    kicker: 'Your call',
    headline: 'You are planning a goal ten years out — say a ₹20,00,000 house deposit. How do you set the target?',
    body: ['This is the decision that quietly ruins most long-term plans.'],
    options: [
      { id: 'today',  title: 'Plan for ₹20,00,000', subtitle: "What it costs in today's money" },
      { id: 'future', title: 'Plan for what it will cost in ten years', subtitle: 'Adjust the target for inflation first' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'Here is the trap',
    verdicts: {
      today: {
        tone: 'cost',
        title: 'You will hit your number and miss your goal.',
        body:
          'At about 6% inflation, a ₹20,00,000 house costs roughly **₹35,80,000** in ten years. Saving diligently to ₹20,00,000 means arriving with a little over half of what you need — and having done nothing wrong except plan in the wrong rupees.',
      },
      future: {
        tone: 'good',
        title: 'This is the only version that works.',
        body:
          'Inflating the target first gives you roughly **₹35,80,000** to aim at. It is a far less comfortable number, which is exactly why most people skip this step — and why their ten-year plans quietly come up short.',
      },
    },
    myth: {
      struck: 'If my investment beats 0%, I am making money.',
      correction:
        'Zero is not the bar. **Inflation is the bar.** A return below it is a loss in everything except the statement.',
    },
    vocab: {
      term: 'Real return',
      definition:
        'Your return after inflation is subtracted — the honest one. Nominal return tells you how many more rupees you have; real return tells you whether you can actually buy more with them.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Two options for money you will not touch for fifteen years. A fixed deposit at a guaranteed 7%. An equity fund with a long-run average nearer 11%, and real ups and downs along the way. Inflation is expected around 6%.',
    options: [
      { id: 'fd-safe', title: 'The FD — a guaranteed 7% beats an uncertain 11%', correct: false,
        rationale: 'Guaranteed 7% against 6% inflation is a guaranteed real return of about 1%. Over fifteen years that barely preserves what you have — the certainty is real, and so is the cost of it.' },
      { id: 'equity-horizon', title: 'The fund — over fifteen years the real return matters more than the smooth ride', correct: true,
        rationale: 'With a fifteen-year horizon, the ~5% real return does far more work than the ~1% the FD offers. The volatility is genuine, but time is what makes it survivable — which is exactly what Investing Basics goes into.' },
      { id: 'no-difference', title: 'Over fifteen years they end up about the same', correct: false,
        rationale: 'A 1% real return against a 5% real return compounds into a very large gap over fifteen years. Small differences in real return are not small once time gets involved.' },
    ],
    cta: 'Check answer',
  },
};

export const J01_INFLATION: Experience = {
  id: 'e01',
  journeyId: 'j01',
  slug: 'why-money-loses-value',
  title: 'Why Does Money Lose Value?',
  mechanicType: 'inflation-basket',
  isCore: true,
  timeSensitive: true,
  concepts: ['inflation', 'purchasing-power', 'inflation-rate', 'real-vs-nominal'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: copy1214 },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: copy1718 },
  },
};
