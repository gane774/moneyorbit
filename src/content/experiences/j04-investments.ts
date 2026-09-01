import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

/**
 * Journey 4 — Investments. Replaces "Banking & Digital Payments".
 *
 * Scope is deliberately narrow: this journey only ever answers "what is this
 * thing I am buying?". Whether it is risky belongs to Investing Basics (J8);
 * when you need the money back belongs to Destinations (J9). Every temptation
 * to drift into risk or horizon here has been left alone on purpose.
 */

export interface Instrument {
  id: string;
  label: string;
  /** What you actually hold. This is the whole lesson. */
  category: 'ownership' | 'pooled' | 'lending' | 'physical';
  line: string;
}

export interface InvestmentParams {
  mode: 'ownership' | 'match' | 'cost-compare';
  /** ownership mode (12-14) */
  company?: { name: string; sharePct: number; goodMonth: number; badMonth: number; stake: number };
  /** match mode (15-16) */
  categories?: { id: string; label: string; hint: string }[];
  instruments?: Instrument[];
  /** cost-compare mode (17-18) */
  compare?: { principal: number; years: number; grossReturn: number;
              funds: { label: string; expenseRatio: number; kind: string }[] };
}

const params1214: InvestmentParams = {
  mode: 'ownership',
  company: {
    name: 'the school notebook shop',
    sharePct: 1,
    goodMonth: 200_000,
    badMonth: 80_000,
    stake: 1_000,
  },
};

const params1516: InvestmentParams = {
  mode: 'match',
  categories: [
    { id: 'ownership', label: 'You own part of a company', hint: 'Your share rises and falls with the business' },
    { id: 'pooled',    label: 'You own units of a pooled fund', hint: 'Many investors, one strategy, many holdings' },
    { id: 'lending',   label: 'You lent money out', hint: 'You get it back with agreed interest' },
    { id: 'physical',  label: 'You own a physical thing', hint: 'Its value is whatever people will pay for it' },
  ],
  instruments: [
    { id: 'stock', label: 'Shares in a company', category: 'ownership',
      line: 'You own a slice of that specific business — profits, losses and all.' },
    { id: 'mf', label: 'Equity mutual fund', category: 'pooled',
      line: 'Your money joins thousands of others; a manager buys many companies with the pool.' },
    { id: 'etf', label: 'ETF', category: 'pooled',
      line: 'Also a pooled basket — but it trades on the exchange during the day, like a share.' },
    { id: 'bond', label: 'Bond', category: 'lending',
      line: 'You lent money to a company or the government; they owe you interest and the amount back.' },
    { id: 'fd', label: 'Fixed deposit', category: 'lending',
      line: 'You lent money to a bank for a fixed period at an agreed rate.' },
    { id: 'gold', label: 'Gold', category: 'physical',
      line: 'You own the metal. It pays you nothing — its value is entirely what someone else will pay.' },
  ],
};

const params1718: InvestmentParams = {
  mode: 'cost-compare',
  compare: {
    principal: 100_000,
    years: 20,
    grossReturn: 10,
    funds: [
      { label: 'Active fund', expenseRatio: 1.8, kind: 'A manager picks the holdings' },
      { label: 'Index fund',  expenseRatio: 0.2, kind: 'Copies an index automatically' },
    ],
  },
};

/* ---------------------------------------------------------------- 12-14 */
const copy1214: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Your school runs a shop selling notebooks. Imagine you owned 1% of it.',
    lines: [
      { text: 'Not 1% of the notebooks. 1% of the shop itself.' },
      { text: 'What would that actually get you?', accent: true },
    ],
    cta: 'Find out',
  },
  explain: {
    kicker: 'What owning means',
    headline: 'A share is a slice of a real business.',
    body: [
      'If you own 1% of the shop, you own 1% of everything it makes — and 1% of every bad month too.',
      'When people say they "bought shares", this is all it means: **they own a small piece of a company**, and their piece is worth whatever the company is worth.',
    ],
    cta: 'See a good month and a bad one',
  },
  interact: {
    kicker: 'Your 1%',
    headline: 'Watch what your slice is worth when the shop does well, and when it does not.',
    labels: {
      good: 'A good month', bad: 'A bad month',
      yours: 'Your 1% is worth', pooled: 'What if you did not pick the shop yourself?',
    },
    cta: 'I see it',
    lockedCta: 'Try both months first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'You have ₹1,000 to put in. Two ways to do it.',
    body: ['Neither is wrong. They are just different things.'],
    options: [
      { id: 'pick',   title: 'Pick one shop yourself', subtitle: 'You choose which business you own a piece of' },
      { id: 'pooled', title: 'Join a pool that buys many shops', subtitle: 'Someone experienced picks a mix for everyone' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'Both are real investing',
    verdicts: {
      pick: {
        tone: 'good',
        title: 'You own one thing, and you chose it.',
        body:
          'Everything rides on that one shop. If it does brilliantly, your slice does brilliantly. If it closes, your ₹1,000 goes with it. **You made the choice, so you carry the outcome.**',
      },
      pooled: {
        tone: 'good',
        title: 'You own a little bit of many things.',
        body:
          'Your ₹1,000 joins everyone else’s, and the pool buys pieces of lots of businesses. One shop closing barely moves it. **You gave up choosing, and got spread instead.** That pool has a name: a mutual fund.',
      },
    },
    myth: {
      struck: 'Investing means picking stocks.',
      correction:
        'Picking companies yourself is **one** way. Joining a pool that buys many is another, and it is how most people actually invest.',
    },
    vocab: {
      term: 'Share',
      definition:
        'A small piece of ownership in a company. Own a share and you own part of that business — its good months and its bad ones.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your cousin says: "I put ₹5,000 into a mutual fund, so I own part of one company now."',
    options: [
      { id: 'right', title: 'He is right', correct: false,
        rationale: 'A mutual fund is not one company. His ₹5,000 joined a pool that holds pieces of many companies at once.' },
      { id: 'many', title: 'He owns a small piece of many companies, not one', correct: true,
        rationale: 'Exactly. That is the difference between buying a share and buying a fund — a share is one business, a fund is a basket of them.' },
      { id: 'none', title: 'He does not own anything — he lent the money', correct: false,
        rationale: 'Lending is what a bond or an FD is. An equity mutual fund buys ownership in companies, so he genuinely owns a slice of each.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 15-16 */
const copy1516: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You have ₹10,000. Six places to put it, and they are not the same kind of thing at all.',
    lines: [
      { text: 'Shares, a mutual fund, an ETF, a bond, a fixed deposit, gold.' },
      { text: 'Which of these actually make you an owner?', accent: true },
    ],
    cta: 'Sort them out',
  },
  explain: {
    kicker: 'Four things you can actually hold',
    headline: 'Every investment is ownership, a pool, a loan, or a thing.',
    body: [
      '**Ownership** — you hold a slice of a business. **Pooled** — your money joins others and a strategy buys many holdings at once.',
      '**Lending** — you handed money over and are owed it back with interest. **Physical** — you own an actual object, worth whatever someone will pay.',
      'Almost everything you will ever be sold is one of these four. Knowing which is which tells you what you are really buying.',
    ],
    cta: 'Sort the six',
  },
  interact: {
    kicker: 'Six instruments',
    headline: 'Put each one where it belongs.',
    labels: { check: 'Check my answers' },
    cta: 'I see it',
    lockedCta: 'Match every instrument first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'You want to invest in companies, but you do not follow the market and have no time to.',
    options: [
      { id: 'stocks', title: 'Buy shares in companies you pick', subtitle: 'You choose, you research, you decide when to sell' },
      { id: 'fund',   title: 'Buy an equity mutual fund', subtitle: 'A strategy picks and holds many companies for you' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'Both own companies. Only one needs your attention.',
    verdicts: {
      stocks: {
        tone: 'cost',
        title: 'Ownership, and a job you said you do not have time for.',
        body:
          'Picking shares means researching businesses and deciding when to buy and sell. It is completely legitimate — but you described someone with no time to follow the market, and this option **requires exactly that**.',
      },
      fund: {
        tone: 'good',
        title: 'Same ownership, someone else doing the choosing.',
        body:
          'An equity fund still owns companies — you still own businesses through it. What you handed over is the **choosing**, not the ownership. That trade is the entire reason mutual funds exist.',
      },
    },
    myth: {
      struck: 'A mutual fund is a type of stock.',
      correction:
        'A stock is **one company you own**. A fund is a **strategy for buying many things at once** — it might hold stocks, bonds, or both.',
    },
    vocab: {
      term: 'Mutual fund',
      definition:
        'A pool of many investors’ money, invested together according to a stated strategy. You own units of the pool rather than any single holding directly.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'You buy a government bond. Your friend says: "Nice, so you own a piece of the government now."',
    options: [
      { id: 'own', title: 'Correct — a bond is ownership', correct: false,
        rationale: 'A bond is a loan, not ownership. You do not get a share of anything — you get your money back plus agreed interest.' },
      { id: 'lend', title: 'No — you lent money and are owed it back with interest', correct: true,
        rationale: 'Exactly. Bonds and FDs are both lending: you hand money over for a period and are owed it back. Shares and equity funds are ownership. Different things entirely.' },
      { id: 'physical', title: 'A bond is a physical asset like gold', correct: false,
        rationale: 'Gold is physical — you own the metal. A bond is a promise to repay, which is lending.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 17-18 */
const copy1718: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Two funds hold the same 50 companies. One charges 1.8% a year. One charges 0.2%.',
    lines: [
      { text: 'Same holdings. Same market. The fee is taken every year either way.' },
      { text: 'Over twenty years, what does that 1.6% difference actually cost?', accent: true },
    ],
    cta: 'Run the numbers',
  },
  explain: {
    kicker: 'What you are paying for',
    headline: 'The expense ratio comes out whether the fund wins or loses.',
    body: [
      'A fund’s **NAV** is simply the price of one unit. Its **expense ratio** is the slice taken every year to run it — charged on your whole balance, not on your profits.',
      'An **active** fund pays people to choose holdings and charges more for it. An **index** fund copies a published index automatically and charges very little. The performance is uncertain; **the fee is not**.',
    ],
    cta: 'See the gap',
  },
  interact: {
    kicker: '₹1,00,000 · 20 years · same 10% gross return',
    headline: 'Same investments, two fee levels. Watch the gap open.',
    labels: {
      active: 'Active fund', index: 'Index fund',
      net: 'Return after fees', ends: 'Ends with', gap: 'Difference',
    },
    cta: 'I see it',
    lockedCta: 'Run the comparison first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'Fund A beat its index in 3 of the last 5 years and charges 1.8%. Fund B just copies the index and charges 0.2%.',
    body: ['This one is genuinely argued over by professionals. There is no trick answer here.'],
    options: [
      { id: 'active', title: 'Fund A — it has beaten the index more often than not', subtitle: '1.8% a year' },
      { id: 'index',  title: 'Fund B — keep the fee, accept the index return', subtitle: '0.2% a year' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'A real disagreement, not a trick',
    verdicts: {
      active: {
        tone: 'cost',
        title: 'You are paying a certain cost for an uncertain benefit.',
        body:
          'Three years out of five is a real record, and it may continue. But the 1.8% leaves **every year, including the losing ones**, and past outperformance is famously poor at predicting future outperformance. That is the bet you are making — and it is a bet, not a purchase.',
      },
      index: {
        tone: 'good',
        title: 'You gave up the chance of beating the market to stop paying for the attempt.',
        body:
          'You will never beat the index this way — by design, you match it minus a very small fee. Over twenty years that fee difference alone compounds into a large sum, which is why this option has become the default recommendation for most long-term investors.',
      },
    },
    myth: {
      struck: 'A higher fee means better management.',
      correction:
        'The fee is **guaranteed**; the outperformance is not. You pay 1.8% in the years the fund wins and in the years it loses.',
    },
    vocab: {
      term: 'Expense ratio',
      definition:
        'The annual percentage a fund charges to run itself, taken from your whole balance regardless of performance. 1.8% on ₹1,00,000 is ₹1,800 a year, every year.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'You want to buy a pooled fund but also want to be able to sell partway through a trading day at a price you can see live. Which suits that better — a mutual fund or an ETF?',
    options: [
      { id: 'mf', title: 'A mutual fund', correct: false,
        rationale: 'Mutual fund units are priced once a day at the closing NAV. You place an order without knowing the exact price you will get.' },
      { id: 'etf', title: 'An ETF', correct: true,
        rationale: 'Right. An ETF is a pooled basket that trades on the exchange like a share, so it has a live price through the day. Both are pooled — the difference is how and when you can trade them.' },
      { id: 'neither', title: 'Neither — pooled funds cannot be sold early', correct: false,
        rationale: 'Both can be sold. The difference is timing and pricing: mutual funds settle at one daily NAV, ETFs trade live during market hours.' },
    ],
    cta: 'Check answer',
  },
};

export const J04_INVESTMENTS: Experience = {
  id: 'e04',
  journeyId: 'j04',
  slug: 'what-are-you-investing-in',
  title: 'What Are You Actually Investing In?',
  mechanicType: 'match-instrument',
  isCore: true,
  timeSensitive: false,
  concepts: ['equity-ownership', 'mutual-funds', 'instrument-types', 'expense-ratio'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: copy1214 },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: copy1718 },
  },
};
