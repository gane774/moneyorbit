/**
 * Topic 11 — the final challenge (items 1-8 of the content brief).
 *
 * Pure logic, no React, so the whole thing is testable and the scoring can be
 * argued with directly.
 *
 * Two rules shape every design decision here:
 *
 *  1. There is no hidden answer key. Nothing is scored against an exact
 *     number. Everything is scored against RATIOS and against what this
 *     person said they want, so ₹10,000 and ₹12,000 on eating out cannot
 *     land on opposite sides of a line.
 *
 *  2. Circumstances decide what "good" means. The same ₹20,000 of lifestyle
 *     spending is fine with an emergency fund behind it and reckless without
 *     one. The scoring reads the situation, not just the split.
 */

export interface Life {
  age: number;
  city: string;
  grossMonthly: number;
  /** Deducted before anything is allocatable. Shown, not hidden. */
  deductions: { label: string; amount: number; note?: string }[];
  commitments: { id: string; label: string; amount: number; note?: string }[];
  startingSavings: number;
  startingDebt: number;
  goals: string[];
}

export interface AllocLine {
  id: string;
  label: string;
  group: 'living' | 'lifestyle' | 'future';
  /** Guidance only. Never used as a target to score against. */
  hint?: string;
}

export const STEP = 10_000;
/** Small lines where ₹10,000 would be absurd; still large enough to be quick. */
export const FINE_STEP = 2_500;
export const FINE_LINES = new Set(['subscriptions', 'phone']);

export const LIFE: Life = {
  age: 27,
  city: 'Bengaluru',
  grossMonthly: 220_000,
  deductions: [
    { label: 'Income tax (TDS)', amount: 44_000, note: 'roughly, at this salary under the new regime' },
    { label: 'Provident fund', amount: 10_800, note: 'yours — it just is not spendable this month' },
    { label: 'Professional tax & insurance', amount: 1_200 },
  ],
  commitments: [
    { id: 'home-emi', label: 'Home loan EMI', amount: 52_000, note: '18 years left' },
    { id: 'utilities', label: 'Utilities & maintenance', amount: 7_000 },
    { id: 'family', label: 'Money sent to parents', amount: 15_000, note: 'not optional' },
  ],
  startingSavings: 0,
  startingDebt: 0,
  goals: [
    'Build an emergency fund — there is nothing behind you right now',
    'Keep the home loan comfortably serviced',
    'Start putting money toward long-term growth',
  ],
};

export const LINES: AllocLine[] = [
  { id: 'groceries',     label: 'Groceries & household', group: 'living' },
  { id: 'transport',     label: 'Transport & fuel',      group: 'living' },
  { id: 'phone',         label: 'Phone & internet',      group: 'living' },
  { id: 'eating-out',    label: 'Eating out',            group: 'lifestyle' },
  { id: 'shopping',      label: 'Shopping',              group: 'lifestyle' },
  { id: 'entertainment', label: 'Entertainment & travel', group: 'lifestyle' },
  { id: 'subscriptions', label: 'Subscriptions',         group: 'lifestyle' },
  { id: 'emergency',     label: 'Emergency fund',        group: 'future', hint: 'you have none' },
  { id: 'investments',   label: 'Long-term investments', group: 'future' },
  { id: 'goal-savings',  label: 'Short-term savings',    group: 'future' },
];

export type Alloc = Record<string, number>;

export function totalDeductions(l: Life = LIFE) {
  return l.deductions.reduce((s, d) => s + d.amount, 0);
}
export function takeHome(l: Life = LIFE) {
  return l.grossMonthly - totalDeductions(l);
}
export function totalCommitments(l: Life = LIFE) {
  return l.commitments.reduce((s, c) => s + c.amount, 0);
}
/** What the student actually gets to decide about. */
export function allocatable(l: Life = LIFE) {
  return takeHome(l) - totalCommitments(l);
}

export function sumGroup(alloc: Alloc, group: AllocLine['group']) {
  return LINES.filter((l) => l.group === group)
    .reduce((s, l) => s + (alloc[l.id] ?? 0), 0);
}
export function totalAllocated(alloc: Alloc) {
  return LINES.reduce((s, l) => s + (alloc[l.id] ?? 0), 0);
}

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

export interface EventOutcome {
  headline: string;
  detail: string;
  /** Change applied to the running emergency fund. */
  emergencyDelta: number;
  debtDelta: number;
  handledWell: boolean;
}

/** Month 3: an unavoidable ₹35,000 repair, met from the fund or from debt. */
export function carRepair(monthlyEmergency: number, monthsElapsed = 3): EventOutcome {
  const fund = monthlyEmergency * monthsElapsed;
  const cost = 35_000;
  if (fund >= cost) {
    return {
      headline: 'Covered, without touching anything else.',
      detail: `Three months of setting aside ${inrPlain(monthlyEmergency)} had built ${inrPlain(fund)}. The repair took ${inrPlain(cost)} of it and nothing else in your month had to move.`,
      emergencyDelta: -cost, debtDelta: 0, handledWell: true,
    };
  }
  const short = cost - fund;
  return {
    headline: `You were ${inrPlain(short)} short.`,
    detail: fund === 0
      ? `You had set nothing aside, so the full ${inrPlain(cost)} went onto a card. This is the month the emergency fund would have paid for itself.`
      : `Your fund covered ${inrPlain(fund)} of it. The remaining ${inrPlain(short)} went onto a card, which now costs you interest every month until it is cleared.`,
    emergencyDelta: -fund, debtDelta: short, handledWell: false,
  };
}

/** Month 8: a bonus. There is no universally right answer — it depends on
 *  the position the student has built by this point. */
export interface BonusChoice { id: string; label: string; detail: string }
export const BONUS = 150_000;
export const BONUS_CHOICES: BonusChoice[] = [
  { id: 'emergency', label: 'Into the emergency fund', detail: 'Boring. Fast to do.' },
  { id: 'debt',      label: 'Clear the card', detail: 'Only useful if you are carrying a balance.' },
  { id: 'invest',    label: 'Invest it', detail: 'Longest horizon, least reachable.' },
  { id: 'spend',     label: 'Spend it', detail: 'A trip, a watch, something you want.' },
  { id: 'split',     label: 'Split it three ways', detail: 'Some to each.' },
];

export function judgeBonus(choice: string, debt: number, emergencyFund: number, monthlyNeed: number): EventOutcome {
  const thin = emergencyFund < monthlyNeed * 3;
  if (choice === 'debt' && debt > 0) {
    return { headline: 'The right call, given where you were.', detail: `You were carrying ${inrPlain(debt)} at card rates. Nothing else you could do with this money returns as much as not paying that interest.`, emergencyDelta: 0, debtDelta: -Math.min(debt, BONUS), handledWell: true };
  }
  if (choice === 'debt' && debt === 0) {
    return { headline: 'Nothing to clear.', detail: 'You had no balance, so this does nothing. Not harmful — just a wasted decision.', emergencyDelta: 0, debtDelta: 0, handledWell: false };
  }
  if (choice === 'emergency') {
    return thin
      ? { headline: 'Exactly what your position needed.', detail: `Your fund was thin — under three months of essentials. ${inrPlain(BONUS)} moves you from exposed to genuinely covered in one step.`, emergencyDelta: BONUS, debtDelta: 0, handledWell: true }
      : { headline: 'Safe, and probably more than you needed.', detail: 'You already had a solid fund. Beyond a few months of cover, more cash sitting still is money not growing anywhere.', emergencyDelta: BONUS, debtDelta: 0, handledWell: false };
  }
  if (choice === 'invest') {
    return thin || debt > 0
      ? { headline: 'Good instinct, wrong order.', detail: debt > 0 ? `Investing while carrying ${inrPlain(debt)} at card rates means borrowing expensively to invest cheaply.` : 'Investing before you have a cushion means the next surprise forces you to sell at whatever price the market happens to be that week.', emergencyDelta: 0, debtDelta: 0, handledWell: false }
      : { headline: 'The right move once the basics are covered.', detail: 'No debt, a real cushion behind you — this is exactly when money should be going somewhere it can grow.', emergencyDelta: 0, debtDelta: 0, handledWell: true };
  }
  if (choice === 'split') {
    return { headline: 'Defensible, and rarely optimal.', detail: 'Splitting avoids the worst outcome and never quite gets the best one. It is a reasonable answer when you genuinely are not sure which need is most pressing.', emergencyDelta: BONUS / 3, debtDelta: -Math.min(debt, BONUS / 3), handledWell: !thin && debt === 0 };
  }
  return thin || debt > 0
    ? { headline: 'This is the expensive one.', detail: debt > 0 ? `You spent it while owing ${inrPlain(debt)}. That balance keeps growing, and this was the month it could have gone.` : 'Spending it while you have no cushion means the next surprise still lands on a card.', emergencyDelta: 0, debtDelta: 0, handledWell: false }
    : { headline: 'You could afford this.', detail: 'No debt, a real fund behind you. Money is for living too, and this is what "affordable" actually means.', emergencyDelta: 0, debtDelta: 0, handledWell: true };
}

/** Month 12: rent rises. Tests flexibility, not virtue. */
export function rentRise(alloc: Alloc, increase = 5_000): EventOutcome {
  const lifestyle = sumGroup(alloc, 'lifestyle');
  const unassigned = allocatable() - totalAllocated(alloc);
  const slack = unassigned + lifestyle;
  if (unassigned >= increase) {
    return { headline: 'Absorbed without a decision.', detail: `You had ${inrPlain(unassigned)} unassigned, so an extra ${inrPlain(increase)} a month simply fits. Nothing had to be cut.`, emergencyDelta: 0, debtDelta: 0, handledWell: true };
  }
  if (slack >= increase * 2) {
    return { headline: 'Absorbed, by giving something up.', detail: `Nothing was spare, so the ${inrPlain(increase)} comes out of lifestyle spending. You had enough there to take it without touching savings — that is what flexibility looks like in practice.`, emergencyDelta: 0, debtDelta: 0, handledWell: true };
  }
  return { headline: 'This one hurts.', detail: `With little unassigned and lifestyle already lean, an extra ${inrPlain(increase)} a month has to come out of what you were saving. A rent rise should not be able to reach your savings — that it can is the warning.`, emergencyDelta: -increase, debtDelta: 0, handledWell: false };
}

/* ------------------------------------------------------------------ *
 * The report
 * ------------------------------------------------------------------ */

export interface Dimension { key: string; icon: string; label: string; score: number; note: string }
export interface Report {
  dimensions: Dimension[];
  overall: number;
  strongest: Dimension;
  weakest: Dimension;
  oneChange: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
function inrPlain(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

export function buildReport(
  alloc: Alloc,
  opts: { debt: number; emergencyFund: number; bonusHandledWell: boolean; rentHandledWell: boolean; repairHandledWell: boolean },
): Report {
  const pool = allocatable();
  const living = sumGroup(alloc, 'living');
  const lifestyle = sumGroup(alloc, 'lifestyle');
  const future = sumGroup(alloc, 'future');
  const unassigned = Math.max(0, pool - totalAllocated(alloc));
  const essentialsMonthly = totalCommitments() + living;

  /* Scored on ranges, never on exact figures. Each dimension is a band with
     generous width, so two sensible budgets a few thousand apart land in the
     same place. */

  // Emergency preparedness: months of essentials covered, plus how the
  // actual repair went — an untested fund is only a claim.
  const months = essentialsMonthly > 0 ? opts.emergencyFund / essentialsMonthly : 0;
  const emergency = clamp(
    Math.min(70, (months / 6) * 70) + (opts.repairHandledWell ? 30 : 0),
  );

  // Budget discipline: share of what they controlled that went to lifestyle.
  // Penalty only starts above 35% and is gradual.
  const lifestyleShare = pool > 0 ? lifestyle / pool : 0;
  const discipline = clamp(100 - Math.max(0, lifestyleShare - 0.35) * 260);

  // Debt: nothing owed is full marks; otherwise scaled against a month of pay.
  const debtRatio = opts.debt / Math.max(1, takeHome());
  const debtScore = clamp(100 - debtRatio * 180);

  // Long-term growth: share directed at investments specifically.
  const investShare = pool > 0 ? (alloc.investments ?? 0) / pool : 0;
  const growth = clamp(Math.min(100, (investShare / 0.20) * 100));

  /* Flexibility: how much of the month could be redirected if something
     changed.
     
     Unassigned money is the real thing and carries most of the score.
     Lifestyle earns partial credit -- ₹30,000 of eating out genuinely is room
     to manoeuvre -- but it is capped low on purpose. An earlier version
     weighted it heavily enough that a plan with 67% lifestyle spending, no
     savings and a card balance scored 100 here and was told flexibility was
     its strongest decision, which is exactly the wrong lesson. Heavy
     discretionary spending is not a financial strength; it is only an easier
     thing to cut. */
  const unassignedShare = pool > 0 ? unassigned / pool : 0;
  const lifestyleShareForFlex = pool > 0 ? lifestyle / pool : 0;
  const flexibility = clamp(
    Math.min(55, (unassignedShare / 0.10) * 55) +
    Math.min(15, (lifestyleShareForFlex / 0.35) * 15) +
    (opts.rentHandledWell ? 30 : 0),
  );

  const dimensions: Dimension[] = [
    { key: 'emergency', icon: '🛟', label: 'Emergency preparedness', score: emergency, note:
        months >= 6 ? 'You built a fund deep enough to absorb a bad month without borrowing.'
        : months >= 3 ? 'You have a real cushion, though not yet a deep one.'
        : months >= 1 ? 'You started a fund, but it is thin enough that one bad month reaches past it.'
        : 'You set almost nothing aside, so any surprise had to go on a card.' },
    { key: 'discipline', icon: '📊', label: 'Budget discipline', score: discipline, note:
        lifestyleShare <= 0.25 ? 'Your discretionary spending left plenty of room for everything else.'
        : lifestyleShare <= 0.4 ? 'Your lifestyle spending was substantial but left room to work with.'
        : `Lifestyle took ${Math.round(lifestyleShare * 100)}% of what you controlled, which crowded out your other priorities.` },
    { key: 'debt', icon: '💳', label: 'Debt management', score: debtScore, note:
        opts.debt === 0 ? 'You finished the year owing nothing.'
        : `You are carrying ${inrPlain(opts.debt)}, which costs you every month it stays.` },
    { key: 'growth', icon: '📈', label: 'Long-term growth', score: growth, note:
        investShare >= 0.15 ? 'A serious share went toward money that grows on its own.'
        : investShare >= 0.05 ? 'You invested something, but most of your surplus stayed still.'
        : 'Almost nothing went toward long-term growth, so your money is not working for you yet.' },
    { key: 'flexibility', icon: '🧘', label: 'Financial flexibility', score: flexibility, note:
        unassignedShare >= 0.1 ? 'You kept enough uncommitted that a change did not force a decision.'
        : unassignedShare > 0 ? 'You kept a little slack — enough to absorb a small change, not a large one.'
        : lifestyleShareForFlex >= 0.3 ? 'Nothing was uncommitted, though your discretionary spending was large enough to cut into if you had to.'
        : 'Every rupee had a job, so anything unexpected had to take money from something else.' },
  ];

  /* Ties are common at the extremes -- a reckless run can put several
     dimensions at zero. Break them by consequence rather than by array order,
     so "you have no emergency fund" outranks "you kept no slack": the advice a
     student walks away with should be the one that matters most. */
  const CONSEQUENCE = ['emergency', 'debt', 'growth', 'discipline', 'flexibility'];
  const rank = (d: Dimension) => CONSEQUENCE.indexOf(d.key);
  const strongest = [...dimensions].sort((a, b) => b.score - a.score || rank(a) - rank(b))[0];
  const weakest = [...dimensions].sort((a, b) => a.score - b.score || rank(a) - rank(b))[0];

  const changes: Record<string, string> = {
    emergency: `Move about ${inrPlain(Math.max(STEP, essentialsMonthly * 0.1))} a month into your emergency fund until it covers six months of essentials. Everything else is easier once that exists.`,
    discipline: `Move roughly ${inrPlain(Math.max(STEP, lifestyle * 0.25))} a month out of eating out and shopping. You would barely feel it, and it doubles what reaches your goals.`,
    debt: 'Clear the card balance before adding anywhere else. Card interest is higher than anything your savings or investments will earn.',
    growth: `Redirect about ${inrPlain(STEP)} a month into long-term investments. At your age the time is worth more than the amount.`,
    flexibility: `Leave around ${inrPlain(Math.max(STEP, pool * 0.08))} unassigned each month. Slack is not wasted money — it is what stops a surprise from reaching your savings.`,
  };

  return {
    dimensions,
    overall: Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length),
    strongest,
    weakest,
    oneChange: changes[weakest.key],
  };
}
