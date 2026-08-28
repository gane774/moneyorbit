import type { Experience, ScreenCopy } from '../types';

export interface CompareIncomeParams {
  active: { name: string; task: string; hourlyRate: number; hoursPerWeek: number; weeksPerMonth: number };
  passive: { name: string; principal: number; ratePct: number };
}

/** Same script for all three bands (per author decision) — the story reads
 *  fine across 12-18 as written, so one params/copy pair is shared. */
const params: CompareIncomeParams = {
  active: { name: 'Kabir', task: 'tutors two juniors on weekends', hourlyRate: 300, hoursPerWeek: 4, weeksPerMonth: 4 },
  passive: { name: 'Zara', principal: 200_000, ratePct: 6 },
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Meet Kabir and Zara. Same goal: extra money every month.',
    lines: [
      { text: 'Very different setups.' },
      { text: 'Which one would you rather have?', accent: true },
    ],
    cta: "Let's see",
  },
  explain: {
    kicker: 'Two kinds of income',
    headline: 'Some money pays you for your time. Some pays you for owning something.',
    body: [
      '**Active income** exists only while you’re doing the work — stop, and it stops.',
      '**Passive income** keeps arriving whether you show up or not.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: 'A normal month',
    headline: 'See where each rupee actually comes from.',
    labels: {
      activeLine: '{{kabirHours}} hrs × {{kabirRate}}/hr × {{kabirWeeks}} weeks',
      passiveLine: '{{zaraPrincipal}} in a fixed deposit at {{zaraRate}}/year, paid automatically',
      passiveExplainer: 'A fixed deposit is money you hand your bank and agree not to touch for a while — in exchange, it pays you extra.',
      examButton: 'Exam week — no extra work happens',
      activePostLabel: '{{kabirName}}, exam week',
      passivePostLabel: '{{zaraName}}, exam week',
    },
    cta: 'I see it',
    lockedCta: 'Run exam week',
  },
  decide: {
    kicker: 'Your call',
    headline: 'If money had to keep showing up no matter what — which setup would you rather build?',
    options: [
      { id: 'active', title: 'Something like {{kabirName}}’s', subtitle: 'Paid for time, whenever you work', figure: '{{kabirMonthly}} a normal month' },
      { id: 'passive', title: 'Something like {{zaraName}}’s', subtitle: 'Paid for owning something, always', figure: '{{zaraMonthly}} every month, no work' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's the catch",
    verdicts: {
      active: {
        tone: 'cost',
        title: 'Great, until you can’t work.',
        body:
          '{{kabirName}}’s {{kabirMonthly}} is real money — but it only exists on weeks {{kabirName}} actually tutors. Exam week, illness, a holiday: the income disappears with the time.',
      },
      passive: {
        tone: 'good',
        title: 'Smaller, but it never needs you.',
        body:
          '{{zaraName}}’s {{zaraMonthly}} is less money than {{kabirName}} makes most months. But it showed up during exam week too — it doesn’t care what {{zaraName}} is doing.',
      },
    },
    myth: {
      struck: 'Income is your job, full stop.',
      correction:
        'A job is **one** way to get paid. It is not the only way — and it is the only kind that stops the moment you do.',
    },
    vocab: {
      term: 'Passive income',
      definition:
        'Money that keeps arriving without ongoing work — interest, rent, dividends. It usually starts smaller than active income, and it never takes a sick day.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Meera coaches badminton on weekends for ₹500 a session, two sessions a week. Farhan rents out his small collection of board games for ₹50 a day, earning about ₹600 a month whether he’s around or not. Meera breaks her arm and can’t coach for a month.',
    options: [
      { id: 'both-stop', title: 'Both incomes stop', correct: false,
        rationale: 'Farhan’s games keep renting out with or without him standing there — that’s the whole point of passive income.' },
      { id: 'meera-stops', title: 'Meera’s stops. Farhan’s keeps coming.', correct: true,
        rationale: 'Meera is paid for her time on court — no court time, no pay. Farhan is paid for something he owns, which doesn’t need his arm to work.' },
      { id: 'neither-stops', title: 'Neither income is affected', correct: false,
        rationale: 'Meera’s income is tied directly to her showing up and coaching. A broken arm stops that completely.' },
    ],
    cta: 'Check answer',
  },
};

export const J02_EARNING: Experience = {
  id: 'e02',
  journeyId: 'j02',
  slug: 'two-ways-to-get-paid',
  title: 'Two Ways to Get Paid',
  mechanicType: 'compare-income',
  isCore: true,
  timeSensitive: false,
  concepts: ['active-income', 'passive-income'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params as unknown as Record<string, unknown>, copy },
    '15-16': { params: params as unknown as Record<string, unknown>, copy },
    '17-18': { params: params as unknown as Record<string, unknown>, copy },
  },
};
