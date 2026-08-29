/**
 * Fictional bank statement (Section 30). Pure data + logic so the tests can
 * drive it; the component only renders.
 *
 * Every row is invented. The point is learning to READ a statement -- spotting
 * what recurs, what is a fee, and what you did not notice you were paying --
 * not modelling any real bank's format.
 */

export interface Txn {
  day: number;
  desc: string;
  amount: number;            // negative = money out
  category: 'income' | 'essential' | 'want' | 'fee' | 'transfer';
  /** Charges that are easy to miss and are the reason to read a statement. */
  sneaky?: boolean;
}

export const OPENING_BALANCE = 4_820;

export const STATEMENT: Txn[] = [
  { day: 1,  desc: 'Salary — Aug',                amount: 35_000, category: 'income' },
  { day: 1,  desc: 'Rent',                        amount: -12_000, category: 'essential' },
  { day: 2,  desc: 'Metro card top-up',           amount: -1_000,  category: 'essential' },
  { day: 3,  desc: 'Groceries',                   amount: -3_240,  category: 'essential' },
  { day: 4,  desc: 'Coffee',                      amount: -260,    category: 'want' },
  { day: 5,  desc: 'Streaming — auto-renew',      amount: -649,    category: 'want', sneaky: true },
  { day: 6,  desc: 'Phone bill',                  amount: -599,    category: 'essential' },
  { day: 8,  desc: 'Dinner with friends',         amount: -1_180,  category: 'want' },
  { day: 9,  desc: 'ATM withdrawal',              amount: -2_000,  category: 'transfer' },
  { day: 9,  desc: 'ATM fee — non-network',       amount: -21,     category: 'fee', sneaky: true },
  { day: 11, desc: 'Groceries',                   amount: -2_180,  category: 'essential' },
  { day: 12, desc: 'Gym — annual, billed monthly', amount: -1_499, category: 'want', sneaky: true },
  { day: 14, desc: 'Cousin — sent',               amount: -2_500,  category: 'transfer' },
  { day: 15, desc: 'Coffee',                      amount: -260,    category: 'want' },
  { day: 17, desc: 'Electricity',                 amount: -1_430,  category: 'essential' },
  { day: 19, desc: 'Online shopping',             amount: -2_899,  category: 'want' },
  { day: 21, desc: 'Music — auto-renew',          amount: -119,    category: 'want', sneaky: true },
  { day: 22, desc: 'Groceries',                   amount: -1_960,  category: 'essential' },
  { day: 24, desc: 'Coffee',                      amount: -260,    category: 'want' },
  { day: 25, desc: 'Cousin — returned',           amount: 2_500,   category: 'transfer' },
  { day: 26, desc: 'Late payment charge',         amount: -350,    category: 'fee', sneaky: true },
  { day: 28, desc: 'Dinner out',                  amount: -1_640,  category: 'want' },
  { day: 30, desc: 'Groceries',                   amount: -1_120,  category: 'essential' },
];

export function runningBalance(txns: Txn[], opening = OPENING_BALANCE): number[] {
  const out: number[] = [];
  let bal = opening;
  for (const t of txns) { bal += t.amount; out.push(bal); }
  return out;
}

export interface StatementSummary {
  moneyIn: number;
  moneyOut: number;
  closing: number;
  byCategory: Record<Txn['category'], number>;
  /** Charges a reader would plausibly not have noticed. */
  sneakyTotal: number;
  sneakyCount: number;
  /** Descriptions appearing more than once, with their combined cost. */
  recurring: { desc: string; times: number; total: number }[];
}

export function summarise(txns: Txn[], opening = OPENING_BALANCE): StatementSummary {
  const byCategory = { income: 0, essential: 0, want: 0, fee: 0, transfer: 0 } as Record<Txn['category'], number>;
  let moneyIn = 0, moneyOut = 0, sneakyTotal = 0, sneakyCount = 0;

  for (const t of txns) {
    byCategory[t.category] += t.amount;
    if (t.amount > 0) moneyIn += t.amount; else moneyOut += -t.amount;
    if (t.sneaky) { sneakyTotal += -t.amount; sneakyCount++; }
  }

  const groups = new Map<string, { times: number; total: number }>();
  for (const t of txns) {
    if (t.amount >= 0) continue;
    const g = groups.get(t.desc) ?? { times: 0, total: 0 };
    g.times++; g.total += -t.amount;
    groups.set(t.desc, g);
  }
  const recurring = [...groups.entries()]
    .filter(([, g]) => g.times > 1)
    .map(([desc, g]) => ({ desc, ...g }))
    .sort((a, b) => b.total - a.total);

  return { moneyIn, moneyOut, closing: opening + moneyIn - moneyOut, byCategory, sneakyTotal, sneakyCount, recurring };
}
