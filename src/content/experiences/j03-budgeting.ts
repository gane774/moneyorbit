import { COMMIT_OPTION_ID } from '../types';
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

/* ------------------------------------------------------------------
   12-14 and 17-18: params are real so the mechanic and every derived
   figure work today. Only the SCREEN COPY is outstanding, and it is
   the standard placeholder so it cannot be mistaken for finished text
   sitting next to the authored 15-16 script.
   ------------------------------------------------------------------ */

/**
 * Pocket money. Three categories, matching the reference path the author
 * gives the student on-screen (₹500 / ₹300 / ₹200). Two events, not three —
 * the 12-14 script is deliberately simpler than 15-16 and 17-18.
 */
const params1214: AllocateParams = {
  pool: 1_000,
  month: 'March',
  categories: [
    { id: 'school',    label: 'School stuff & lunch',    suggested: 500, essential: true  },
    { id: 'fun',       label: 'Snacks, games, outings',  suggested: 300, essential: false },
    { id: 'aside',     label: 'Set aside for surprises', suggested: 200, essential: false },
  ],
  events: [
    { id: 'ev1', day: 6,  label: 'Water bottle cracks',        amount: 80 },
    { id: 'ev2', day: 13, label: "Friend's birthday, a gift",  amount: 180 },
  ],
  bufferTarget: 200,
};

/**
 * First salary. Six categories, matching the reference path the author
 * gives the student on-screen (₹12,000 / ₹6,000 / ₹3,000 / ₹1,500 /
 * ₹5,500 / ₹7,000).
 */
const params1718: AllocateParams = {
  pool: 35_000,
  month: 'March',
  categories: [
    { id: 'rent',      label: 'Rent',               suggested: 12_000, essential: true  },
    { id: 'food',      label: 'Groceries & food',   suggested: 6_000,  essential: true  },
    { id: 'transport', label: 'Commute',            suggested: 3_000,  essential: true  },
    { id: 'phone',     label: 'Phone & data',       suggested: 1_500,  essential: true  },
    { id: 'wants',     label: 'Wants',              suggested: 5_500,  essential: false },
    { id: 'aside',     label: 'Set aside for surprises', suggested: 7_000, essential: false },
  ],
  events: [
    { id: 'ev1', day: 5,  label: 'Phone screen cracks',           amount: 2_200 },
    { id: 'ev2', day: 14, label: "Cousin's wedding — gift + travel", amount: 4_400 },
    { id: 'ev3', day: 21, label: 'Annual subscription renews',    amount: 2_500 },
  ],
  bufferTarget: 7_000,
};


/* ------------------------------------------------------------------
   12-14 script. Same misconception, same six-screen shape as 15-16.
   The Decide screen here COMMITS the allocation made in Interact rather
   than branching -- the student's real choice already happened when they
   split the pool, so Decide's job is to lock it in, not offer a second
   choice that would contradict the first.
   ------------------------------------------------------------------ */
const copy1214: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You get ₹1,000 for the month.',
    lines: [
      { text: 'You plan it out perfectly. Every rupee has a job.' },
      { text: 'So will your plan actually survive the month?', accent: true },
    ],
    cta: "Let's find out",
  },

  explain: {
    kicker: 'How a month actually works',
    headline: 'A budget is a guess about the future.',
    body: [
      "You don't know exactly what's coming — a lost pencil case, a friend's birthday, a torn shoe.",
      "The real test isn't the plan. It's **what happens when the month doesn't go the way you guessed**.",
    ],
    cta: 'Try it yourself',
  },

  interact: {
    kicker: 'Your month · ₹1,000',
    headline: 'Split it however you want.',
    labels: {
      pool: 'Money in',
      allocated: 'Given a job',
      remaining: 'Left to allocate',
      balance: 'Left in hand',
      day: 'Day',
      events: 'What actually happened',
      essential: 'Hard to skip',
    },
    cta: 'Lock in my budget',
    lockedCta: 'Assign every rupee first',
  },

  decide: {
    kicker: 'Lock it in',
    headline: 'This is your plan for the month.',
    body: ['No changes once it starts.'],
    cta: 'Lock in my budget',
  },

  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      [COMMIT_OPTION_ID]: {
        tone: 'cost',
        title: 'You were {{shortfall}} short — on day {{dayRanOut}}',
        lines: [
          'Day 6 — your water bottle cracks. {{ev1}}.',
          "Day 13 — your friend's birthday. A gift costs {{ev2}}.",
        ],
        body:
          "Total surprises: **{{eventsTotal}}**. You'd set aside {{setAside}}. That was **{{shortfall}} short** — right on gift day.",
      },
    },
    myth: {
      struck: "I'll just track it in my head.",
      correction:
        "Your head budgets for the month you're **expecting**. It never budgets for the month you **get**.",
    },
    vocab: {
      term: 'Cash flow',
      definition:
        'The money moving in and out of your pocket over time. A budget guesses at it. The real month decides it.',
    },
    cta: 'Got it',
  },

  practice: {
    kicker: 'Quick check',
    prompt:
      'Your cousin plans ₹1,000 — ₹600 for wants, ₹400 for savings, ₹0 set aside for surprises. Halfway through, his cycle chain snaps. ₹150 to fix.',
    options: [
      {
        id: 'fine', title: "He's fine, nothing changes", correct: false,
        rationale:
          'Nothing in his plan has a job called "surprises" — so ₹150 has to come from somewhere, and it changes something.',
      },
      {
        id: 'adjust', title: 'He has to take it from savings or skip something', correct: true,
        rationale:
          'Exactly. With nothing set aside, an unplanned cost always has to come out of a plan that was built for something else.',
      },
      {
        id: 'auto', title: 'His plan protects him automatically', correct: false,
        rationale:
          'A plan only protects you from what it was built to absorb. His had nothing set aside for surprises, so it absorbs nothing.',
      },
    ],
    cta: 'Check answer',
  },
};

/* ------------------------------------------------------------------
   17-18 script. Same shape, adult numbers and stakes.
   ------------------------------------------------------------------ */
const copy1718: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Your first salary lands. ₹35,000.',
    lines: [
      { text: 'You plan every rupee before the month even starts.' },
      { text: 'So will your plan actually survive the month?', accent: true },
    ],
    cta: "Let's find out",
  },

  explain: {
    kicker: 'How a month actually works',
    headline: 'A budget is a guess about the future.',
    body: [
      "Rent and groceries are predictable. Life isn't. A phone screen cracks, a friend's wedding needs a gift, a cousin asks to split a cab.",
      "The plan isn't the test — **the month is**.",
    ],
    cta: 'Try it yourself',
  },

  interact: {
    kicker: 'Your month · ₹35,000',
    headline: 'Split it however you want.',
    labels: {
      pool: 'Money in',
      allocated: 'Given a job',
      remaining: 'Left to allocate',
      balance: 'Left in hand',
      day: 'Day',
      events: 'What actually happened',
      essential: 'Hard to skip',
    },
    cta: 'Lock in my budget',
    lockedCta: 'Assign every rupee first',
  },

  decide: {
    kicker: 'Lock it in',
    headline: 'This is your plan for the month.',
    body: ['No changes once it starts.'],
    cta: 'Lock in my budget',
  },

  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      [COMMIT_OPTION_ID]: {
        tone: 'cost',
        title: 'You were {{shortfall}} short — on day {{dayRanOut}}',
        lines: [
          'Day 5 — phone screen cracks. {{ev1}} to fix.',
          "Day 14 — a cousin's wedding. Gift + travel: {{ev2}}.",
          'Day 21 — an annual subscription renews without warning: {{ev3}}.',
        ],
        body:
          "Total surprises: **{{eventsTotal}}**. You'd set aside {{setAside}}. That was **{{shortfall}} short** — the day the subscription hit.",
      },
    },
    myth: {
      struck: "I'll just track it in my head.",
      correction:
        "Your head budgets for the month you're **expecting**. It never budgets for the month you **get**.",
    },
    vocab: {
      term: 'Cash flow',
      definition:
        'The money moving in and out of your account over time. A budget guesses at it. The real month decides it.',
    },
    cta: 'Got it',
  },

  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend earns ₹30,000 and budgets rent, food and commute down to the rupee — ₹0 set aside for anything unplanned. Her laptop charger dies mid-month. ₹1,800 to replace.',
    options: [
      {
        id: 'covered', title: 'Her budget already covers it', correct: false,
        rationale:
          "Budgeted down to the rupee means every rupee already has a job — none of them is 'unplanned charger'.",
      },
      {
        id: 'cut', title: 'She has to cut something else or use a card', correct: true,
        rationale:
          'With zero set aside, ₹1,800 has to come from a category that was meant for something else, or from debt.',
      },
      {
        id: 'wont-happen', title: "This won't actually happen to a careful planner", correct: false,
        rationale:
          'Careful planning controls the categories. It cannot control which day a charger decides to die.',
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
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: copy1214 },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: copy1718 },
  },
};
