/**
 * Financial Life Simulator (Section 31).
 *
 * Pure logic, no React: it is the part worth testing, and keeping it free of
 * components means the test suite can drive it directly.
 *
 * The explicit design constraint from the brief is that the highest fictional
 * net worth must NOT be presented as the best outcome. So the simulator never
 * declares a winner by wealth. It reports what actually happened -- whether
 * you could absorb a shock without borrowing, whether you carried debt, how
 * often you were forced into a choice you did not want -- and net worth is one
 * line among several, not a score.
 */

export interface SimState {
  month: number;
  age: number;
  incomeMonthly: number;
  cash: number;
  savings: number;
  debt: number;
  /** Months where an unavoidable cost could not be met from cash or savings. */
  timesForcedToBorrow: number;
  /** Months that ended with every essential paid and nothing borrowed. */
  monthsSurvivedCleanly: number;
  log: string[];
}

export interface SimChoice {
  id: string;
  label: string;
  detail: string;
  apply: (s: SimState) => SimState;
}

export interface SimEvent {
  id: string;
  title: string;
  body: string;
  /** Unavoidable costs hit whether or not the player has the money. */
  cost?: number;
  choices: SimChoice[];
}

export const STARTING_STATE: SimState = {
  month: 1,
  age: 18,
  incomeMonthly: 35_000,
  cash: 50_000,
  savings: 0,
  debt: 0,
  timesForcedToBorrow: 0,
  monthsSurvivedCleanly: 0,
  log: [],
};

/** Essentials are not optional and are deducted before any choice is offered. */
export const ESSENTIALS_MONTHLY = 22_000;

const clone = (s: SimState): SimState => ({ ...s, log: [...s.log] });

/**
 * Pay an unavoidable cost from cash, then savings, then debt. Borrowing is the
 * last resort and is counted, because "did you have to borrow?" is the thing
 * this simulator is actually teaching.
 */
export function payCost(state: SimState, amount: number, reason: string): SimState {
  const s = clone(state);
  let owed = amount;

  const fromCash = Math.min(s.cash, owed);
  s.cash -= fromCash;
  owed -= fromCash;

  if (owed > 0) {
    const fromSavings = Math.min(s.savings, owed);
    s.savings -= fromSavings;
    owed -= fromSavings;
  }

  if (owed > 0) {
    s.debt += owed;
    s.timesForcedToBorrow += 1;
    s.log.push(`Month ${s.month}: borrowed ₹${Math.round(owed).toLocaleString('en-IN')} for ${reason}.`);
  } else {
    s.log.push(`Month ${s.month}: paid ₹${Math.round(amount).toLocaleString('en-IN')} for ${reason}.`);
  }
  return s;
}

/** Income in, essentials out. Debt accrues 18% a year on the balance. */
export function advanceMonth(state: SimState): SimState {
  let s = clone(state);
  s.cash += s.incomeMonthly;
  s = payCost(s, ESSENTIALS_MONTHLY, 'essentials');

  if (s.debt > 0) {
    const interest = s.debt * (18 / 100 / 12);
    s.debt += interest;
    // Any spare cash goes at the debt automatically: leaving it to compound
    // while cash sits idle would be modelling a mistake the app teaches against.
    const repay = Math.min(s.cash, s.debt);
    s.cash -= repay;
    s.debt -= repay;
  }

  const cleanMonth = s.debt === 0 && s.cash >= 0;
  if (cleanMonth) s.monthsSurvivedCleanly += 1;

  s.month += 1;
  if ((s.month - 1) % 12 === 0) s.age += 1;
  return s;
}

export function netWorth(s: SimState): number {
  return s.cash + s.savings - s.debt;
}

/**
 * What the run actually showed. Deliberately not a score and deliberately not
 * ranked by net worth: a player who ends richer but borrowed four times has
 * demonstrated something worse than one who ended poorer and never did.
 */
export interface SimVerdict { headline: string; points: string[] }

export function summarise(s: SimState): SimVerdict {
  const points: string[] = [];
  const months = s.month - 1;

  points.push(
    s.timesForcedToBorrow === 0
      ? `You got through ${months} months without ever borrowing.`
      : `You had to borrow ${s.timesForcedToBorrow} time${s.timesForcedToBorrow === 1 ? '' : 's'}.`,
  );
  points.push(
    s.savings > 0
      ? `You finished with ₹${Math.round(s.savings).toLocaleString('en-IN')} set aside.`
      : 'You finished with nothing set aside for a surprise.',
  );
  if (s.debt > 0) {
    points.push(`You still owe ₹${Math.round(s.debt).toLocaleString('en-IN')}, and it grows every month.`);
  }
  points.push(`Net worth: ₹${Math.round(netWorth(s)).toLocaleString('en-IN')} — one number among several, not a score.`);

  const headline =
    s.timesForcedToBorrow === 0 && s.savings > 0
      ? 'Nothing forced your hand.'
      : s.timesForcedToBorrow === 0
        ? 'You never borrowed — but you have no cushion.'
        : 'A surprise decided things for you.';

  return { headline, points };
}

/** Fixed, ordered scenario. Not random: everyone meets the same situations. */
export const EVENTS: SimEvent[] = [
  {
    id: 'first-salary',
    title: 'Your first salary lands.',
    body: 'You have ₹35,000 a month coming in and ₹50,000 already saved. Essentials take ₹22,000. What do you do with the rest?',
    choices: [
      {
        id: 'save-half', label: 'Move ₹6,000 to savings', detail: 'Keep the rest as spending money',
        apply: (s) => { const n = clone(s); const m = Math.min(6_000, n.cash); n.cash -= m; n.savings += m; n.log.push(`Month ${n.month}: moved ₹${m.toLocaleString('en-IN')} to savings.`); return n; },
      },
      {
        id: 'spend', label: 'Keep it all as spending money', detail: 'Nothing set aside this month',
        apply: (s) => { const n = clone(s); n.log.push(`Month ${n.month}: set nothing aside.`); return n; },
      },
      {
        id: 'save-most', label: 'Move ₹11,000 to savings', detail: 'Live tight, build a cushion fast',
        apply: (s) => { const n = clone(s); const m = Math.min(11_000, n.cash); n.cash -= m; n.savings += m; n.log.push(`Month ${n.month}: moved ₹${m.toLocaleString('en-IN')} to savings.`); return n; },
      },
    ],
  },
  {
    id: 'phone',
    title: 'Your phone dies.',
    body: 'You need a working phone for your job. A reliable replacement is ₹18,000; a cheap one is ₹7,000 and may not last the year.',
    choices: [
      { id: 'good', label: 'Buy the ₹18,000 phone', detail: 'Should last several years', apply: (s) => payCost(s, 18_000, 'a phone') },
      { id: 'cheap', label: 'Buy the ₹7,000 phone', detail: 'Cheaper now, may cost again later', apply: (s) => payCost(s, 7_000, 'a cheap phone') },
    ],
  },
  {
    id: 'wedding',
    title: "A close friend's wedding.",
    body: 'Travel and a gift come to ₹12,000. You can go, or you can skip it.',
    choices: [
      { id: 'go', label: 'Go', detail: '₹12,000', apply: (s) => payCost(s, 12_000, 'a wedding') },
      { id: 'skip', label: 'Skip it', detail: 'Keep the money', apply: (s) => { const n = clone(s); n.log.push(`Month ${n.month}: skipped the wedding.`); return n; } },
    ],
  },
  {
    id: 'medical',
    title: 'A medical bill you did not plan for.',
    body: '₹25,000, due now. This one is not optional.',
    cost: 25_000,
    choices: [
      { id: 'pay', label: 'Pay it', detail: 'From cash, then savings, then borrowing', apply: (s) => payCost(s, 25_000, 'a medical bill') },
    ],
  },
  {
    id: 'raise',
    title: 'You get a raise.',
    body: 'Your income rises to ₹42,000 a month. Do you let your spending rise with it?',
    choices: [
      {
        id: 'lifestyle', label: 'Spend the difference', detail: 'Live better now',
        apply: (s) => { const n = clone(s); n.incomeMonthly = 42_000; n.log.push(`Month ${n.month}: raise to ₹42,000, spending rose to match.`); return n; },
      },
      {
        id: 'bank-it', label: 'Keep living on ₹35,000', detail: 'Send ₹7,000 a month to savings',
        apply: (s) => { const n = clone(s); n.incomeMonthly = 42_000; n.savings += 0; n.log.push(`Month ${n.month}: raise to ₹42,000, banked the difference.`); return n; },
      },
    ],
  },
];
