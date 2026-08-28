import type { Experience, ScreenCopy } from '../types';

export interface Bucket { id: 'safe' | 'balanced' | 'risky'; label: string; minReturn: number; maxReturn: number }

export interface AllocatePortfolioParams {
  principal: number;
  years: number;
  buckets: Bucket[];
}

/** Same script for both eligible bands (15-16, 17-18). */
const params: AllocatePortfolioParams = {
  principal: 10_000,
  years: 5,
  buckets: [
    { id: 'safe', label: 'Safe', minReturn: 4, maxReturn: 6 },
    { id: 'balanced', label: 'Balanced', minReturn: 8, maxReturn: 12 },
    { id: 'risky', label: 'Risky', minReturn: -10, maxReturn: 25 },
  ],
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You have ₹10,000 to invest for 5 years. Pick a bucket.',
    lines: [
      { text: 'Safe. Balanced. Risky. Each one behaves differently.' },
      { text: 'Run the same one twice — see what happens.', accent: true },
    ],
    cta: "Let's pick",
  },
  explain: {
    kicker: 'Return and risk move together',
    headline: 'A wider range of good outcomes always comes with a wider range of bad ones.',
    body: [
      'A **higher potential return** is not a better investment by itself.',
      'It is a trade: more upside, in exchange for more room to fall.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: '₹10,000 · 5 years',
    headline: 'Pick a bucket and run it. Then run it again.',
    labels: { run: 'Run 5 years' },
    cta: 'I see the pattern',
    lockedCta: 'Run a bucket at least twice',
  },
  decide: {
    kicker: 'Your call',
    headline: 'Real money, a real 5-year goal. Which bucket do you actually pick?',
    options: [
      { id: 'safe', title: 'Safe', subtitle: '{{safeRange}} a year', figure: 'Predictable' },
      { id: 'balanced', title: 'Balanced', subtitle: '{{balancedRange}} a year', figure: 'Some swing, trends up' },
      { id: 'risky', title: 'Risky', subtitle: '{{riskyRange}} a year', figure: 'Could be either extreme' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's the honest version",
    verdicts: {
      safe: {
        tone: 'good',
        title: 'Steady, and that is the whole point.',
        body:
          'Your money barely moves — {{safeRange}} is a narrow band on purpose. You will not get rich in Safe, and you also will not get a nasty surprise.',
      },
      balanced: {
        tone: 'good',
        title: 'Some wobble, mostly upward.',
        body:
          'You saw real swing between runs inside {{balancedRange}} — but it trended up either way. That is the entire idea of "balanced."',
      },
      risky: {
        tone: 'cost',
        title: 'You got lucky. Or you didn’t.',
        body:
          'Same {{riskyRange}} bucket, two runs, two very different numbers. That is not a bug — that is what "risky" means. The best run you saw is exactly as real as the worst one.',
      },
    },
    myth: {
      struck: 'Higher return means a better investment.',
      correction:
        'Higher **potential** return. That one word carries the whole trade — it also means a wider range of bad outcomes, not just good ones.',
    },
    vocab: {
      term: 'Diversification',
      definition:
        'Spreading money across more than one bucket instead of picking just one. It cannot remove the swings you just saw in Risky — but it can stop your whole result from depending on a single run of luck.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend put money in the Risky bucket last month and got a great result. "Risky is clearly the best choice," he says. "Look at my number."',
    options: [
      { id: 'agree', title: 'He’s right — the numbers don’t lie', correct: false,
        rationale: 'One good run proves the range includes good outcomes. It says nothing about which outcome you’ll actually get next time.' },
      { id: 'one-run', title: 'One good run doesn’t prove it was the right call', correct: true,
        rationale: 'Exactly. He saw one draw from a wide range. The same bucket, run again, could have landed at the other end just as easily.' },
      { id: 'always-risky', title: 'He should keep putting everything in Risky from now on', correct: false,
        rationale: 'That’s betting that luck repeats. The range that gave him a great result is the same range that can just as easily go the other way.' },
    ],
    cta: 'Check answer',
  },
};

export const J08_INVESTING: Experience = {
  id: 'e08',
  journeyId: 'j08',
  slug: 'pick-your-risk',
  title: 'Pick Your Risk',
  mechanicType: 'allocate-portfolio',
  isCore: true,
  timeSensitive: false,
  concepts: ['risk-return', 'diversification', 'volatility'],
  availableTo: ['15-16', '17-18'],
  ageVariants: {
    '15-16': { params: params as unknown as Record<string, unknown>, copy },
    '17-18': { params: params as unknown as Record<string, unknown>, copy },
  },
};
