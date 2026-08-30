import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

/**
 * Topic 11 — the final challenge.
 *
 * Replaces "Don't Get Scammed", whose material now lives where it is actually
 * used: the PIN and collect-request lessons moved into Banking (Journey 4),
 * where a student is already deciding whether to approve something.
 *
 * This topic is not another lesson. It hands the student an adult financial
 * life and asks them to run it for a year. The copy here supplies the framing
 * screens; the simulation itself is driven by lib/sim/finalChallenge and
 * rendered by the FinalChallenge component, which is why this file carries no
 * mechanic parameters.
 */

const copy: ScreenCopy = {
  hook: {
    kicker: 'Final challenge',
    headline: 'You have learned how money works. Now run a life with it.',
    lines: [
      { text: 'You are 27, in Bengaluru, earning well. There is a home loan, a family to help, and nothing saved behind you.' },
      { text: 'Every choice costs something else. That is the whole exercise.', accent: true },
    ],
    cta: 'Take it on',
  },
  explain: {
    kicker: 'How this works',
    headline: 'Allocate a month. Then live a year with it.',
    body: [
      'First you will see what actually reaches your account — gross pay, what is deducted, and what is already committed before you decide anything.',
      'Then you split what is left. **There is no correct split.** Things will happen over the year, and how you handled them depends on the room you left yourself.',
    ],
    cta: 'Show me the life',
  },
  interact: {
    kicker: 'Your year',
    headline: 'Run it.',
    cta: 'See my report',
    lockedCta: 'Finish the year first',
  },
  decide: {
    kicker: 'Looking back',
    headline: 'Which of these would you actually change first?',
    body: ['Your report is on the next screen either way. This is what you think before you see it.'],
    options: [
      { id: 'save-more', title: 'Save more, earlier', subtitle: 'Build the cushion before anything else' },
      { id: 'spend-less', title: 'Spend less on lifestyle', subtitle: 'Redirect it toward goals' },
      { id: 'invest-more', title: 'Invest more of the surplus', subtitle: 'Put the money somewhere it grows' },
      { id: 'nothing', title: 'Nothing — I would run it the same way', subtitle: 'The trade-offs were the ones I wanted' },
    ],
    cta: 'See the report',
  },
  feedback: {
    kicker: 'One thing worth keeping',
    verdicts: {
      'save-more': {
        tone: 'good', title: 'The instinct almost everyone gets right in hindsight.',
        body: 'A cushion is the only thing that stops an ordinary surprise from becoming a debt. It is also the least satisfying thing to fund, which is exactly why it usually goes last.',
      },
      'spend-less': {
        tone: 'good', title: 'True, and worth being specific about.',
        body: '"Spend less" rarely survives contact with a real month. Naming the line and the amount — ₹10,000 less on eating out, moved to investments — is what actually changes.',
      },
      'invest-more': {
        tone: 'good', title: 'Right, once the order is right.',
        body: 'Investing is where money grows, and it comes after a cushion and after expensive debt. Investing while carrying a card balance is borrowing at a high rate to earn at a lower one.',
      },
      nothing: {
        tone: 'good', title: 'That is a legitimate answer.',
        body: 'If you kept a cushion, stayed out of debt and still had a life, there is nothing to apologise for. A plan you would not repeat is a worse plan than one you would.',
      },
      [COMMIT_OPTION_ID]: {
        tone: 'good', title: 'You ran a year of it.',
        body: 'Your report covers what held up and what did not.',
      },
    },
    myth: {
      struck: 'Earning more solves it.',
      correction:
        'You just ran ₹2,20,000 a month. It was still possible to end the year with nothing set aside and a balance on a card. **Income decides the size of the numbers, not whether the plan works.**',
    },
    vocab: {
      term: 'Take-home pay',
      definition:
        'What actually reaches your account after tax and deductions. It is the only number worth budgeting against — the figure in the offer letter is not money you have.',
    },
    cta: 'Finish',
  },
  practice: {
    kicker: 'Last one',
    prompt:
      'Two people earn the same and end the year with the same amount saved. One kept ₹15,000 a month unassigned; the other allocated every rupee and hit their targets exactly. Their rent goes up ₹6,000.',
    options: [
      {
        id: 'same', title: 'Both are fine — they saved the same amount', correct: false,
        rationale: 'They saved the same, and only one of them can absorb the increase without changing anything. Identical outcomes can come from very different amounts of room.',
      },
      {
        id: 'slack-better', title: 'The one with slack is in a better position', correct: true,
        rationale: 'Exactly. Their savings are equal but their flexibility is not. The one who allocated everything now has to take the ₹6,000 from something that already had a job — usually the savings.',
      },
      {
        id: 'precise-better', title: 'The precise one is better — no money was wasted', correct: false,
        rationale: 'Unassigned money is not wasted; it is the thing that absorbs change. A plan with no slack works perfectly until the first month that does not go to plan.',
      },
    ],
    cta: 'Check answer',
  },
};

export const J11_FINAL: Experience = {
  id: 'e11',
  journeyId: 'j11',
  slug: 'final-challenge',
  title: 'Run a Financial Life',
  mechanicType: 'final-challenge',
  isCore: true,
  timeSensitive: false,
  concepts: ['budgeting', 'emergency-fund', 'net-worth'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: {}, copy },
    '15-16': { params: {}, copy },
    '17-18': { params: {}, copy },
  },
};
