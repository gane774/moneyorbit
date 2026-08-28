import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

export interface Instrument { id: string; label: string; line: string }
export interface GoalCard {
  id: string; goalLabel: string; timeline: string; amount: number;
  correctInstrumentId: string; reasoning: string;
}

export interface MatchGoalParams {
  instruments: Instrument[];
  goals: GoalCard[];
}

const instruments: Instrument[] = [
  { id: 'cash', label: 'Cash / Wallet', line: 'Instant, but easy to spend without meaning to.' },
  { id: 'savings', label: 'Savings Account', line: 'Safe and always there, but grows almost nothing.' },
  { id: 'rd', label: 'Recurring Deposit (RD)', line: 'Add a fixed amount every month, locked in as you go.' },
  { id: 'fd', label: 'Fixed Deposit (FD)', line: 'Lock in one lump sum for a set time — safe, and it grows the whole time you leave it alone.' },
  { id: 'sip', label: 'Mutual Fund SIP', line: 'Small regular amounts go into the market — it can dip along the way, but tends to grow more over many years.' },
];

/** Same script for all three bands (per author decision). */
const params: MatchGoalParams = {
  instruments,
  goals: [
    { id: 'weekend', goalLabel: 'Weekend plans', timeline: 'next Friday', amount: 500,
      correctInstrumentId: 'cash', reasoning: 'Needed almost immediately — locking it away anywhere would be pointless.' },
    { id: 'phone', goalLabel: 'New phone', timeline: '6 months', amount: 15_000,
      correctInstrumentId: 'savings', reasoning: 'Needed soon. It has to stay safe and easy to reach, not locked up chasing a better return.' },
    { id: 'laptop', goalLabel: 'Laptop', timeline: '18 months', amount: 50_000,
      correctInstrumentId: 'rd', reasoning: 'A fixed amount every month matches a fixed timeline, with a slightly better return than plain savings.' },
    { id: 'college', goalLabel: 'College application costs', timeline: '3 years', amount: 100_000,
      correctInstrumentId: 'fd', reasoning: 'Locked in, guaranteed, better return — as long as you don’t touch it early.' },
    { id: 'highered', goalLabel: 'Higher-education fund', timeline: '8–10 years', amount: 500_000,
      correctInstrumentId: 'sip', reasoning: 'Long enough to absorb the ups and downs along the way — the one goal here where extra risk actually makes sense.' },
  ],
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Five things you’re saving for. Five very different timelines.',
    lines: [
      { text: 'A weekend out. A phone. College. Higher education, years away.' },
      { text: 'Does the same place for your money work for all of them?', accent: true },
    ],
    cta: "Let's match them",
  },
  explain: {
    kicker: 'One question decides everything',
    headline: 'The right place for your money depends on one thing: when you need it back.',
    body: [
      'Money you need **soon** has to stay safe and easy to reach.',
      'Money you won’t touch for **years** can afford to take a few hard knocks along the way.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: 'Match each goal',
    headline: 'Where does this money actually belong?',
    cta: "I've matched them all",
    lockedCta: 'Match every goal',
  },
  decide: {
    kicker: 'Lock it in',
    headline: 'This is your ladder — from money you need next week to money you won’t touch for a decade.',
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's the full ladder",
    verdicts: {
      [COMMIT_OPTION_ID]: {
        tone: 'good',
        title: 'Short-term stays safe. Long-term gets to grow.',
        lines: [
          'Next Friday → Cash. Instant, no lock-up needed.',
          '6 months → Savings. Safe and reachable.',
          '18 months → RD. A fixed rhythm for a fixed timeline.',
          '3 years → FD. Locked, guaranteed, better return.',
          '8–10 years → SIP. Long enough to ride out the dips.',
        ],
        body: 'Notice the pattern: **risk goes up only as your timeline gets longer** — never the other way around.',
      },
    },
    myth: {
      struck: 'There’s one best place to put money.',
      correction:
        'There is no single best place — only the best place **for how soon you need it back**.',
    },
    vocab: {
      term: 'Liquidity',
      definition:
        'How quickly you can turn something into spendable cash without losing value. Cash is fully liquid. A 3-year FD isn’t — and that’s the trade you make for a better return.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend keeps his 2-month emergency fund in a Mutual Fund SIP "because it grows more." A medical bill shows up and the market happens to be down 12% that week.',
    options: [
      { id: 'fine', title: 'No problem — SIPs always grow eventually', correct: false,
        rationale: '"Eventually" doesn’t help him this week. An emergency fund has to be there exactly when the emergency is, not whenever the market recovers.' },
      { id: 'stuck', title: 'He has to withdraw at a loss, right when he can least afford it', correct: true,
        rationale: 'Exactly — the whole point of an emergency fund is availability on demand. Putting it somewhere that can be down on the day you need it defeats the purpose.' },
      { id: 'wait', title: 'He should just wait for the market to recover first', correct: false,
        rationale: 'The bill doesn’t wait. That’s precisely the mismatch between a short-term need and a long-term instrument.' },
    ],
    cta: 'Check answer',
  },
};

export const J09_DESTINATIONS: Experience = {
  id: 'e09',
  journeyId: 'j09',
  slug: 'match-the-goal',
  title: 'Match the Goal',
  mechanicType: 'match-goal',
  isCore: true,
  timeSensitive: false,
  concepts: ['liquidity', 'time-horizon', 'saving-vs-investing'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params as unknown as Record<string, unknown>, copy },
    '15-16': { params: params as unknown as Record<string, unknown>, copy },
    '17-18': { params: params as unknown as Record<string, unknown>, copy },
  },
};
