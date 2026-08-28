import type { Experience, ScreenCopy } from '../types';

/**
 * REFERENCE IMPLEMENTATION #2 (Section 6).
 *
 * Written to sit alongside j06-credit as the second worked example, so the
 * remaining nine have two formats to copy rather than one.
 *
 * The design problem here is different from J6. Credit had a single number
 * (total interest) that settles the argument. Budgeting does not — a month
 * can be "affordable" on paper and still fail. So the interaction has to
 * demonstrate TIMING, not just totals, and the events must be ones the
 * student could not have predicted. That is the whole point: the failure
 * being taught is not carelessness, it is the arrogance of thinking an
 * unplanned month can be planned in your head.
 *
 * Deliberate design choice (Section 23): the events are survivable. Total
 * shocks are Rs 1,300 against a Rs 800 buffer plus Rs 500 set aside, so a
 * student who kept a buffer finishes the month WITHOUT borrowing. A harder
 * month would teach helplessness instead of the lesson.
 */

export interface AllocateParams {
  /** Monthly money in, per band (Section 6: pocket money -> salary). */
  pool: number;
  month: string;
  categories: {
    id: string;
    label: string;
    suggested: number;
    /** Drives the needs-vs-wants concept without ever using those words. */
    essential: boolean;
  }[];
  /** Unpredictable by design — the student cannot pre-empt these. */
  events: { id: string; day: number; label: string; amount: number }[];
  /** What the Decide screen's option B sets aside up front. */
  bufferTarget: number;
}

const params1516: AllocateParams = {
  pool: 5_000,
  month: 'March',
  categories: [
    { id: 'phone',     label: 'Phone & data',       suggested: 300,   essential: true  },
    { id: 'food',      label: 'Food & canteen',     suggested: 1_200, essential: true  },
    { id: 'transport', label: 'Bus & auto',         suggested: 800,   essential: true  },
    { id: 'going-out', label: 'Going out',          suggested: 900,   essential: false },
    { id: 'shopping',  label: 'Clothes & shopping', suggested: 800,   essential: false },
    { id: 'subs',      label: 'Subscriptions',      suggested: 500,   essential: false },
    { id: 'aside',     label: 'Set aside',          suggested: 500,   essential: false },
  ],
  events: [
    { id: 'ev1', day: 6,  label: 'School project materials', amount: 250 },
    { id: 'ev2', day: 13, label: "Friend's birthday gift",   amount: 350 },
    { id: 'ev3', day: 21, label: 'Cracked phone screen',     amount: 700 },
  ],
  bufferTarget: 1_000,
};

const copy1516: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: '₹5,000 for the month. You know roughly where it goes.',
    lines: [
      { text: "Phone, food, bus, going out. You've never written it down. You've never needed to." },
      { text: 'Can you make it to the 30th?', accent: true },
    ],
    cta: 'Find out',
  },

  explain: {
    kicker: 'How a month actually works',
    headline: 'Money arrives once. It leaves thirty times.',
    body: [
      'It comes in one lump, then goes out in **dozens of small pieces** spread across the month.',
      'Running out is rarely about the total. It is about **the month you get** not being the month you planned.',
    ],
    cta: 'Try it yourself',
  },

  interact: {
    kicker: 'March · ₹5,000',
    headline: 'Give every rupee a job.',
    labels: {
      pool: 'Money in',
      allocated: 'Given a job',
      remaining: 'Still unassigned',
      balance: 'Left in hand',
      day: 'Day',
      events: 'What actually happened',
      essential: 'Hard to skip',
    },
    cta: 'Run the month',
    lockedCta: 'Assign every rupee first',
  },

  decide: {
    kicker: 'Your call',
    headline: 'Next month. Same ₹5,000. How do you run it?',
    options: [
      {
        id: 'head',
        title: 'Keep it in your head',
        subtitle: 'You know your spending now — just be more careful',
        figure: '{{pool}} to spend',
      },
      {
        id: 'buffer',
        title: 'Set aside {{buffer}} first',
        subtitle: 'Untouchable. Budget whatever is left',
        figure: '{{spendable}} to spend',
      },
    ],
    cta: 'Lock it in',
  },

  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      head: {
        tone: 'cost',
        title: 'You ran out on day {{dayRanOut}}',
        body:
          'Being careful worked until the surprises arrived — a dentist visit, a farewell contribution, a charger that died. Different things, **{{eventsTotal}} again**. Your {{setAside}} ran out and you were **{{shortfall}} short**, so you had to ask someone to cover it.',
      },
      buffer: {
        tone: 'good',
        title: 'You made it to day 30',
        body:
          'A completely different set of surprises turned up, totalling **{{eventsTotal}}**. You did not predict a single one of them — you did not have to. Your **{{buffer}}** covered most of it and the last **{{bufferGap}}** cost you one night out. You finished **owing nobody**.',
      },
    },
    myth: {
      struck: "I'll just track it in my head.",
      correction:
        'Your head budgets for the month you are **expecting**. It never budgets for the month you **get**.',
    },
    vocab: {
      term: 'Cash flow',
      definition:
        'Money in, money out, and — the part that catches people — when each one happens. You can have enough for the whole month and still be stuck on the 21st.',
    },
    cta: 'Got it',
  },

  practice: {
    kicker: 'Quick check',
    prompt:
      "Your friend gets ₹2,000 a month. Phone, bus pass and lunch come to ₹1,700. They want a ₹200-a-month gaming subscription. 'I'll still have ₹100 left,' they say.",
    options: [
      {
        id: 'fits',
        title: 'It fits',
        subtitle: '₹300 spare minus ₹200 leaves ₹100',
        correct: false,
        rationale:
          'The arithmetic is right, which is exactly why this is tempting. But that ₹100 is now the entire budget for a cracked screen, a birthday and a school trip. One surprise and they are borrowing.',
      },
      {
        id: 'not-safely',
        title: 'Not safely',
        subtitle: 'That leaves ₹100 for everything unplanned',
        correct: true,
        rationale:
          'Same trap you just walked into. Their fixed costs are covered and the subscription fits on paper — but nothing is left for the month they actually get.',
      },
      {
        id: 'swap',
        title: 'Only if they drop something',
        subtitle: 'Swap it for a cost they already have',
        correct: false,
        rationale:
          'Better instinct than just adding it, and worth doing. But the real problem is not this one subscription — it is that ₹300 was never a buffer to begin with. Dropping something else and keeping zero spare leaves them just as exposed.',
      },
    ],
    cta: 'Check answer',
  },
};

export const J03_BUDGETING: Experience = {
  id: 'e03',
  journeyId: 'j03',
  slug: 'can-you-survive-the-month',
  title: 'Can You Survive the Month?',
  mechanicType: 'allocate-events',
  isCore: true,
  timeSensitive: false,
  concepts: ['budgeting', 'cash-flow', 'needs-vs-wants'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
  },
};
