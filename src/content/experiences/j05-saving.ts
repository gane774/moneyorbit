import type { Experience, ScreenCopy } from '../types';

export interface ParallelShockParams {
  shockAmount: number;
  withFund: { name: string; savings: number; weeklyRebuild: number };
  withoutFund: { name: string };
}

/** Same script for all three bands (per author decision). */
const params: ParallelShockParams = {
  shockAmount: 3_000,
  withFund: { name: 'Naina', savings: 5_000, weeklyRebuild: 100 },
  withoutFund: { name: 'Ishaan' },
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Naina and Ishaan both ride scooters to school. Today, both break down.',
    lines: [
      { text: 'Same repair. Same ₹3,000 bill. Same day.' },
      { text: 'One of them handles it without missing a beat.', accent: true },
    ],
    cta: 'See what happens',
  },
  explain: {
    kicker: 'The one thing that’s different',
    headline: 'One of them has been quietly saving. The other hasn’t.',
    body: [
      'Naina has ₹5,000 set aside from pocket money and festival gifts over the past year.',
      'Ishaan has ₹0 saved. The same shock is about to hit both of them.',
    ],
    cta: 'Run the week',
  },
  interact: {
    kicker: 'The ₹3,000 bill',
    headline: 'Same shock, same day. Watch what happens to each of them.',
    labels: { run: 'Run the week', reveal: 'One week later' },
    cta: 'I see the difference',
    lockedCta: 'Run the week',
  },
  decide: {
    kicker: 'Your call',
    headline: 'It’s your ₹3,000 repair bill now. What do you do about the next one?',
    options: [
      { id: 'start', title: 'Start building a cushion now', subtitle: 'A little, regularly, before you need it', figure: 'like Naina' },
      { id: 'wait', title: 'Deal with it when it happens', subtitle: 'Figure it out if a bill shows up', figure: 'like Ishaan' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      start: {
        tone: 'good',
        title: 'You just bought yourself options.',
        body:
          'The next surprise bill doesn’t get to dictate your week. You pay it, keep moving, and **rebuild the cushion after** — same as Naina did.',
      },
      wait: {
        tone: 'cost',
        title: 'The next surprise bill now runs your week.',
        body:
          'Not because you did anything wrong — you just handed the **timing** of your problems to whatever breaks first. That’s what Ishaan is dealing with right now.',
      },
    },
    myth: {
      struck: "I'll deal with it when it happens.",
      correction:
        'By the time "it happens," the only options left are **borrowing, waiting, or going without**. An emergency fund is what you build **before** that.',
    },
    vocab: {
      term: 'Emergency fund',
      definition:
        'Money set aside specifically for the unplanned — not for goals, not for spending, just sitting there for the day something breaks. It doesn’t need to be huge to change what a bad day costs you.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Two students’ laptop chargers die on the same day — ₹1,800 to replace, needed for online classes. One has ₹6,000 saved. One has ₹0.',
    options: [
      { id: 'same', title: 'Both handle it about the same way', correct: false,
        rationale: 'One of them pays and moves on the same day. The other has to find ₹1,800 from somewhere else first — that’s not the same experience.' },
      { id: 'saved-easier', title: 'The one with savings has a much easier week', correct: true,
        rationale: 'Exactly. ₹1,800 out of ₹6,000 barely registers. ₹1,800 out of ₹0 means borrowing, waiting, or missing class.' },
      { id: 'unsaved-easier', title: 'The one with no savings is actually fine — they’ll manage', correct: false,
        rationale: '“Managing” here means asking someone for money or going without class access. That’s a real cost, even if it’s not measured in rupees.' },
    ],
    cta: 'Check answer',
  },
};

export const J05_SAVING: Experience = {
  id: 'e05',
  journeyId: 'j05',
  slug: 'the-rainy-day-test',
  title: 'The Rainy Day Test',
  mechanicType: 'parallel-shock',
  isCore: true,
  timeSensitive: false,
  concepts: ['emergency-fund', 'saving-vs-investing'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params as unknown as Record<string, unknown>, copy },
    '15-16': { params: params as unknown as Record<string, unknown>, copy },
    '17-18': { params: params as unknown as Record<string, unknown>, copy },
  },
};
