import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

/**
 * Budgeting & Cash-Flow.
 *
 * Rewritten from "allocate a pool and see what breaks". The old version asked
 * a student to produce a good budget before anything had taught them what one
 * looks like -- so a plan was judged against a standard they had no way to
 * know. Diagnosing someone else's budget is the easier skill and the one that
 * transfers: you can look at a set of numbers and say which line is the
 * problem and why.
 *
 * No universal correct percentage is ever asserted. Each flaw is explained by
 * what it COSTS this particular person, given what they have said they want.
 */

export interface BudgetFlaw {
  id: string;
  label: string;
  /** True where the line is genuinely the problem in THIS budget. */
  isProblem: boolean;
  why: string;
}

export interface FindProblemParams {
  personName: string;
  personContext: string;
  income: number;
  incomeLabel: string;
  goal: string;
  lines: { label: string; amount: number; note?: string }[];
  leftover: number;
  flaws: BudgetFlaw[];
}

const params1214: FindProblemParams = {
  personName: 'Aarav',
  personContext: 'Aarav is 13. He gets ₹1,000 a month and wants a ₹3,000 cricket bat by the end of the season — three months away.',
  income: 1_000,
  incomeLabel: 'Pocket money',
  goal: 'A ₹3,000 cricket bat, three months away',
  lines: [
    { label: 'Canteen snacks', amount: 400 },
    { label: 'Mobile game top-ups', amount: 250 },
    { label: 'Bus fare', amount: 150, note: 'has to happen' },
    { label: 'Saving for the bat', amount: 100 },
  ],
  leftover: 100,
  flaws: [
    {
      id: 'saving-too-low', label: 'Only ₹100 saved for the bat', isProblem: true,
      why: 'At ₹100 a month the bat takes thirty months, not three. The goal he named is not reachable on this plan — nothing else in the budget matters as much as that gap.',
    },
    {
      id: 'game-topups', label: '₹250 on game top-ups', isProblem: true,
      why: 'This is two and a half times what he puts toward the thing he says he wants. Moving even half of it changes the bat from thirty months away to about ten.',
    },
    {
      id: 'bus-fare', label: '₹150 on bus fare', isProblem: false,
      why: 'This is how he gets to school. It is the one line here he cannot decide against, so it is not where the problem is.',
    },
    {
      id: 'snacks', label: '₹400 on canteen snacks', isProblem: false,
      why: 'It is the biggest line, which makes it look guilty — but he eats at school every day and this is not unreasonable for that. Big is not the same as wrong.',
    },
  ],
};

const params1516: FindProblemParams = {
  personName: 'Meera',
  personContext: 'Meera is 16. She earns ₹5,000 a month tutoring juniors. She wants to visit her cousin in Pune during the break — about ₹6,000 — and she has nothing saved.',
  income: 5_000,
  incomeLabel: 'Tutoring income',
  goal: 'A ₹6,000 trip in four months, from ₹0 saved',
  lines: [
    { label: 'Phone and data', amount: 400, note: 'hard to skip' },
    { label: 'Food and canteen', amount: 1_200, note: 'hard to skip' },
    { label: 'Going out with friends', amount: 1_500 },
    { label: 'Clothes and shopping', amount: 1_100 },
    { label: 'Subscriptions', amount: 600 },
    { label: 'Set aside for the trip', amount: 200 },
  ],
  leftover: 0,
  flaws: [
    {
      id: 'trip-unreachable', label: '₹200 a month toward a ₹6,000 trip', isProblem: true,
      why: 'Four months at ₹200 is ₹800. She will arrive at the break with an eighth of what the trip costs. The plan and the goal are not describing the same year.',
    },
    {
      id: 'subs-stacked', label: '₹600 of subscriptions', isProblem: true,
      why: 'Subscriptions are the easiest line to not notice, because nobody decides to pay them each month — they just continue. ₹600 is three times what she is putting toward the thing she actually wants.',
    },
    {
      id: 'no-buffer', label: 'Nothing left unassigned', isProblem: true,
      why: 'Every rupee has a job, which sounds disciplined, but it means any surprise has to come out of a category meant for something else. There is no slack at all in this month.',
    },
    {
      id: 'food', label: '₹1,200 on food and canteen', isProblem: false,
      why: 'She has to eat. This is a real cost of getting through the day, and cutting it is not where the ₹6,000 is going to come from.',
    },
  ],
};

const params1718: FindProblemParams = {
  personName: 'Rohan',
  personContext: 'Rohan is 22 and just started working. He takes home ₹38,000 a month, has ₹0 saved, and is sending ₹5,000 home each month. He wants to move into his own place next year.',
  income: 38_000,
  incomeLabel: 'Take-home pay',
  goal: 'A deposit for his own place, roughly ₹60,000, next year',
  lines: [
    { label: 'Rent (shared flat)', amount: 11_000, note: 'hard to skip' },
    { label: 'Family contribution', amount: 5_000, note: 'committed' },
    { label: 'Groceries and food', amount: 6_000, note: 'hard to skip' },
    { label: 'Commute', amount: 2_500, note: 'hard to skip' },
    { label: 'Eating out and going out', amount: 7_000 },
    { label: 'Shopping', amount: 3_500 },
    { label: 'Subscriptions', amount: 1_200 },
    { label: 'Set aside', amount: 1_800 },
  ],
  leftover: 0,
  flaws: [
    {
      id: 'no-emergency', label: '₹1,800 set aside, with ₹0 behind him', isProblem: true,
      why: 'He has no emergency fund at all and this builds one at ₹1,800 a month. A single ₹20,000 surprise — a medical bill, a laptop, a trip home — puts him into debt, and it would take almost a year at this rate to be ready for one.',
    },
    {
      id: 'lifestyle-heavy', label: '₹10,500 on eating out and shopping', isProblem: true,
      why: 'That is more than a quarter of his take-home, and nearly six times what he saves. Nothing is wrong with either line on its own — the problem is the ratio against a deposit he says he wants next year.',
    },
    {
      id: 'goal-unreachable', label: 'The ₹60,000 deposit', isProblem: true,
      why: 'At ₹1,800 a month he reaches about ₹21,600 in a year. The deposit is not close, so either the timeline moves or the discretionary lines do.',
    },
    {
      id: 'family', label: '₹5,000 sent home', isProblem: false,
      why: 'This is a real obligation, not a lifestyle choice, and treating it as the flexible line would be the wrong lesson. Budgets have commitments that are not up for negotiation.',
    },
    {
      id: 'rent', label: '₹11,000 rent in a shared flat', isProblem: false,
      why: 'Under a third of take-home for housing, and already shared. This is one of the more sensible numbers in the budget.',
    },
  ],
};

function makeCopy(p: FindProblemParams): ScreenCopy {
  return {
    hook: {
      kicker: 'Before we start',
      headline: `${p.personName} wrote out a budget. It adds up perfectly.`,
      lines: [
        { text: p.personContext },
        { text: 'It still will not do what they want it to. Can you see why?', accent: true },
      ],
      cta: 'Show me the budget',
    },
    explain: {
      kicker: 'What a budget can hide',
      headline: 'Adding up is the easy part. Pointing in the right direction is not.',
      body: [
        'A budget can balance to the last rupee and still quietly make the thing you want **impossible**.',
        'So the question is never "does it add up" — it is **what does this plan actually do** over the next few months.',
      ],
      cta: 'Find the problems',
    },
    interact: {
      kicker: `${p.personName}'s month`,
      headline: 'Tap every line you think is a problem.',
      labels: {
        income: p.incomeLabel,
        goal: 'What they want',
        check: 'Check my answers',
      },
      cta: 'I see it',
      lockedCta: 'Check your answers first',
    },
    decide: {
      kicker: 'Your call',
      headline: `If ${p.personName} could change one thing, what should it be?`,
      body: ['There is more than one defensible answer. The reasoning is what matters.'],
      options: [
        { id: 'cut-wants', title: 'Move money from the discretionary lines', subtitle: 'Same income, different priorities' },
        { id: 'extend', title: 'Keep the spending, move the deadline', subtitle: 'The goal takes longer, and that is allowed' },
        { id: 'earn-more', title: 'Find more income', subtitle: 'Change the top line instead of the rest' },
      ],
      cta: 'Lock it in',
    },
    feedback: {
      kicker: 'All three of those work',
      verdicts: {
        'cut-wants': {
          tone: 'good',
          title: 'The fastest lever, and the one people avoid.',
          body:
            'Moving money out of the discretionary lines changes the outcome immediately, because those are the only lines that are genuinely optional. It costs something real, though — a budget with nothing enjoyable in it tends not to survive the month.',
        },
        extend: {
          tone: 'good',
          title: 'An honest answer, not a cop-out.',
          body:
            'Pushing the deadline is a legitimate decision as long as it is **decided** rather than discovered. What goes wrong is expecting the original date while funding a much longer one — the plan and the goal quietly disagreeing.',
        },
        'earn-more': {
          tone: 'good',
          title: 'True, and the slowest to arrange.',
          body:
            'More income solves it without giving anything up, which is why it is the most popular answer. It is also the one you control least and the one that takes longest to arrive — so it is rarely the only thing to do.',
        },
      },
      myth: {
        struck: 'A budget that adds up is a budget that works.',
        correction:
          'Adding up only proves you will not run out this month. Whether it gets you anywhere depends on **what the lines are pointed at**.',
      },
      vocab: {
        term: 'Cash flow',
        definition:
          'Money in, money out, and when each happens. A budget describes the plan; cash flow is what actually occurs — including the surprise in week three that the plan never mentioned.',
      },
      cta: 'Got it',
    },
    practice: {
      kicker: 'Quick check',
      prompt:
        'Two people earn the same. One spends 55% on needs, 35% on wants, 10% saved. The other spends 70% on needs, 10% on wants, 20% saved. Which budget is better?',
      options: [
        {
          id: 'first', title: 'The first — lower fixed costs mean more freedom', correct: false,
          rationale: 'Lower fixed costs are genuinely useful, but 10% saved against 35% on wants may still miss what that person is aiming at. You cannot tell from the percentages alone.',
        },
        {
          id: 'depends', title: 'You cannot tell without knowing what each is for', correct: true,
          rationale: 'Right. Someone saving for a deposit next year and someone with no near-term goal need different plans. A percentage split is only good or bad relative to what it is meant to achieve.',
        },
        {
          id: 'second', title: 'The second — saving 20% is always better', correct: false,
          rationale: 'Saving more is usually good, and "always" is doing too much work. That person is spending 70% on needs, which may mean a housing cost worth fixing before congratulating the savings rate.',
        },
      ],
      cta: 'Check answer',
    },
  };
}

export const J03_BUDGETING: Experience = {
  id: 'e03',
  journeyId: 'j03',
  slug: 'can-you-survive-the-month',
  title: "What's Wrong With This Budget?",
  mechanicType: 'find-problem',
  isCore: true,
  timeSensitive: false,
  concepts: ['budgeting', 'cash-flow', 'needs-vs-wants'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: makeCopy(params1214) },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: makeCopy(params1516) },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: makeCopy(params1718) },
  },
};
