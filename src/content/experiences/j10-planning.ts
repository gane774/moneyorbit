import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

export interface GoalOption { id: string; label: string; amount: number; months: number }
export interface GoalPlannerParams { goals: GoalOption[] }

const params1214: GoalPlannerParams = {
  goals: [
    { id: 'controller', label: 'Gaming controller / earphones', amount: 2_500, months: 4 },
    { id: 'cricket', label: 'Cricket bat / sports gear', amount: 4_000, months: 8 },
  ],
};
const params1516: GoalPlannerParams = {
  goals: [
    { id: 'phone', label: 'Phone upgrade', amount: 20_000, months: 12 },
    { id: 'trip', label: 'Trip with friends over break', amount: 6_000, months: 6 },
  ],
};
const params1718: GoalPlannerParams = {
  goals: [
    { id: 'laptop', label: 'Laptop for college', amount: 55_000, months: 15 },
    { id: 'testprep', label: 'Test-prep and fees', amount: 40_000, months: 10 },
    { id: 'emergency', label: 'Emergency-fund seed', amount: 10_000, months: 5 },
  ],
};

function makeCopy(): ScreenCopy {
  return {
    hook: {
      kicker: 'Before we start',
      headline: 'Everyone’s saving for something.',
      lines: [
        { text: 'Pick a goal below — one you’d actually want.' },
        { text: 'Watch the vague wish turn into an actual number.', accent: true },
      ],
      cta: "Let's map it",
    },
    explain: {
      kicker: 'The whole trick',
      headline: 'A goal without a number isn’t a plan — it’s a wish.',
      body: [
        'Amount, divided by how many months you’ve got. That’s it.',
        'That single number is the difference between "someday" and an actual **monthly target**.',
      ],
      cta: 'Try it yourself',
    },
    interact: {
      kicker: 'Pick a goal',
      headline: 'Watch the math turn it into a monthly number.',
      cta: 'That’s my number',
      lockedCta: 'Pick a goal to begin',
    },
    decide: {
      kicker: 'Lock it in',
      headline: 'This is your money map.',
      body: ['Come back and check how you’re doing against it.'],
      cta: 'Lock it in',
    },
    feedback: {
      kicker: "The method, not just the number",
      verdicts: {
        [COMMIT_OPTION_ID]: {
          tone: 'good',
          title: 'Every goal you’ll ever have uses this same math.',
          body:
            '**Amount ÷ months = your monthly number.** A bigger goal just means a bigger number or more months — the method never changes, only the inputs do.',
        },
      },
      myth: {
        struck: 'Goals are vague wishes.',
        correction:
          'A goal with **no amount and no date** is a wish. The moment you attach both, it becomes a monthly number you can actually hit.',
      },
      vocab: {
        term: 'Net worth',
        definition:
          'Everything you own, minus everything you owe. Every goal you actually fund — instead of just wishing for — is one more thing quietly building that number up.',
      },
      cta: 'Got it',
    },
    practice: {
      kicker: 'Quick check',
      prompt:
        'Your friend says: "I want to save ₹9,000 for a new bike. I’ll just save what I can, when I can." Three months later, she has ₹1,200.',
      options: [
        { id: 'bad-luck', title: 'She just had bad luck this time', correct: false,
          rationale: '“Save what I can, when I can” was never going to hit ₹9,000 — there was no monthly number to aim for in the first place.' },
        { id: 'no-target', title: 'She never actually set a monthly target', correct: true,
          rationale: 'Exactly. ₹9,000 with no timeline attached isn’t a plan — it’s a wish. A real goal would have told her "save ₹1,500 a month" from day one.' },
        { id: 'save-more', title: 'She should just try to save harder next time', correct: false,
          rationale: '"Try harder" isn’t a number. Without a specific monthly target, there’s nothing to actually try harder at.' },
      ],
      cta: 'Check answer',
    },
  };
}

export const J10_PLANNING: Experience = {
  id: 'e10',
  journeyId: 'j10',
  slug: 'your-money-map',
  title: 'Your Money Map',
  mechanicType: 'goal-planner',
  isCore: true,
  timeSensitive: false,
  concepts: ['goal-setting', 'net-worth', 'time-horizon'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: makeCopy() },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: makeCopy() },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: makeCopy() },
  },
};
