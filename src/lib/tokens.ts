import { compound, computeLoan, futureValueMonthly, inr } from './money';
import type { ChoiceFastforwardParams } from '@/content/experiences/j01-mindset';
import type { CompareIncomeParams } from '@/content/experiences/j02-earning';
import type { CompoundCurveParams } from '@/content/experiences/j07-math';
import type { AllocatePortfolioParams } from '@/content/experiences/j08-investing';
import type { AllocateParams } from '@/content/experiences/j03-budgeting';
import type { EmiParams } from '@/content/experiences/j06-credit';

/** Replaces {{token}} in content copy. Unknown tokens are left visible on
 *  purpose so a typo in the CMS shows up instead of silently rendering blank. */
export function resolveTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, key: string) =>
    key in tokens ? tokens[key] : whole,
  );
}

/**
 * Derived figures for the emi-slider mechanic.
 * Uses the DEFAULT amount and rate, not the student's slider position —
 * the Decide screen says "Same bike. Same Rs 3,00,000", so the two loans
 * being compared must hold everything constant except tenure.
 */
export function emiTokens(p: EmiParams): Record<string, string> {
  const amount = p.amount.default;
  const rate = p.rate.default;

  const a = computeLoan(amount, rate, p.optionA.years);
  const b = computeLoan(amount, rate, p.optionB.years);

  return {
    amount: inr(amount),
    rate: `${rate}%`,
    emiA: inr(a.emi),
    emiB: inr(b.emi),
    interestA: inr(a.totalInterest),
    interestB: inr(b.totalInterest),
    totalA: inr(a.totalPaid),
    totalB: inr(b.totalPaid),
    difference: inr(b.totalInterest - a.totalInterest),
    emiDifference: inr(a.emi - b.emi),
    yearsA: String(p.optionA.years),
    yearsB: String(p.optionB.years),
  };
}

/**
 * Derived figures for the allocate-events mechanic.
 *
 * `dayRanOut` is computed by walking the events in date order and spending
 * the month's slack against them, rather than being written into the copy.
 * If an author retunes the pool or the events, the Feedback screen follows
 * automatically instead of quietly stating a day that is no longer true.
 */
/**
 * `actual` is the student's real allocation from the mechanic (category id
 * -> amount). Omit it to fall back to the params' suggested split — used
 * only by scripts/tools that check an experience's math before the mechanic
 * has run. In the app, LessonPlayer always passes the real allocation, so
 * Feedback reflects what the student actually did, not the reference split
 * shown as a hint on the Interact screen.
 */
export function allocateTokens(
  p: AllocateParams,
  actual?: Record<string, number>,
): Record<string, string> {
  const amountFor = (categoryId: string, suggested: number) =>
    actual ? (actual[categoryId] ?? 0) : suggested;

  const eventsTotal = p.events.reduce((sum, e) => sum + e.amount, 0);
  const setAside = p.categories
    .filter((c) => c.id === 'aside')
    .reduce((sum, c) => sum + amountFor(c.id, c.suggested), 0);
  const essentials = p.categories
    .filter((c) => c.essential)
    .reduce((sum, c) => sum + amountFor(c.id, c.suggested), 0);

  // The head-tracking path: only the "set aside" pot absorbs surprises.
  // Walk events in date order and find where it runs dry.
  let slack = setAside;
  let dayRanOut = 0;
  for (const e of [...p.events].sort((x, y) => x.day - y.day)) {
    slack -= e.amount;
    if (slack < 0 && dayRanOut === 0) dayRanOut = e.day;
  }
  const shortfall = Math.max(0, eventsTotal - setAside);

  return {
    pool: inr(p.pool),
    buffer: inr(p.bufferTarget),
    spendable: inr(p.pool - p.bufferTarget),
    setAside: inr(setAside),
    essentials: inr(essentials),
    wants: inr(p.pool - essentials - setAside),
    eventsTotal: inr(eventsTotal),
    shortfall: inr(shortfall),
    bufferGap: inr(Math.max(0, eventsTotal - p.bufferTarget)),
    dayRanOut: String(dayRanOut || p.events[p.events.length - 1].day),
    month: p.month,
    // ev1, ev2, ... in the order authored in params (chronological in every
    // experience so far). Lets Feedback copy narrate the specific shocks —
    // "Day 6 — your water bottle cracks. {{ev1}}." — without the day and
    // amount risking drift from what the mechanic actually generated.
    ...Object.fromEntries(p.events.map((e, i) => [`ev${i + 1}`, inr(e.amount)])),
  };
}

/** Derived figures for the choice-fastforward mechanic (J1). */
export function choiceFastforwardTokens(p: ChoiceFastforwardParams): Record<string, string> {
  const fv = compound(p.itemCost, p.rate, p.years);
  return {
    item: p.itemLabel,
    cost: inr(p.itemCost),
    years: String(p.years),
    rate: `${p.rate}%`,
    landingAge: String(p.landingAge),
    fv: inr(fv),
    growth: inr(fv - p.itemCost),
  };
}

/** Derived figures for the compare-income mechanic (J2). */
export function compareIncomeTokens(p: CompareIncomeParams): Record<string, string> {
  const kabirMonthly = p.active.hourlyRate * p.active.hoursPerWeek * p.active.weeksPerMonth;
  const zaraMonthly = (p.passive.principal * p.passive.ratePct) / 100 / 12;
  return {
    kabirName: p.active.name,
    kabirTask: p.active.task,
    kabirRate: inr(p.active.hourlyRate),
    kabirHours: String(p.active.hoursPerWeek),
    kabirWeeks: String(p.active.weeksPerMonth),
    kabirMonthly: inr(kabirMonthly),
    zaraName: p.passive.name,
    zaraPrincipal: inr(p.passive.principal),
    zaraRate: `${p.passive.ratePct}%`,
    zaraMonthly: inr(zaraMonthly),
  };
}

/** Derived figures for the compound-curve mechanic (J7). Decide compares
 *  "start 10 years earlier" against "find a 2-point-better rate," both
 *  measured from the same default start age, so the two levers are a fair
 *  side-by-side rather than an arbitrary pair of numbers. */
export function compoundCurveTokens(p: CompoundCurveParams): Record<string, string> {
  const { early, late, rate } = p.race;
  const years = (startAge: number) => p.untilAge - startAge;

  const earlyFv = futureValueMonthly(early.monthly, rate, years(early.startAge));
  const lateFv  = futureValueMonthly(late.monthly,  rate, years(late.startAge));
  const earlyPaid = early.monthly * 12 * years(early.startAge);
  const latePaid  = late.monthly  * 12 * years(late.startAge);

  return {
    principal: inr(p.principal),
    untilAge: String(p.untilAge),
    inflation: `${p.inflation}%`,

    earlyName: early.name,
    lateName: late.name,
    earlyStart: String(early.startAge),
    lateStart: String(late.startAge),
    earlyMonthly: inr(early.monthly),
    lateMonthly: inr(late.monthly),
    raceRate: `${rate}%`,

    earlyFv: inr(earlyFv),
    lateFv: inr(lateFv),
    earlyPaid: inr(earlyPaid),
    latePaid: inr(latePaid),
    // Rounded before subtracting so the gap equals what the two figures
    // printed beside it actually subtract to.
    extraPaid: inr(Math.round(latePaid) - Math.round(earlyPaid)),
    raceGap: inr(Math.round(earlyFv) - Math.round(lateFv)),
  };
}


/** Derived figures for the allocate-portfolio mechanic (J8). Static per
 *  params — the randomized run outcomes live in the mechanic itself, not
 *  here, since Decide/Feedback describe the buckets, not one specific run. */
export function allocatePortfolioTokens(p: AllocatePortfolioParams): Record<string, string> {
  const range = (id: string) => {
    const b = p.buckets.find((x) => x.id === id)!;
    return `${b.minReturn}% to ${b.maxReturn}%`;
  };
  return {
    principal: inr(p.principal),
    years: String(p.years),
    safeRange: range('safe'),
    balancedRange: range('balanced'),
    riskyRange: range('risky'),
  };
}
