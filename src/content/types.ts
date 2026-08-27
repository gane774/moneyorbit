/* ============================================================
   Content schema.
   Section 6: content is DATA, not code. Nothing in this file
   contains lesson copy — it defines the shape copy must satisfy.
   ============================================================ */

export type AgeBand = '12-14' | '15-16' | '17-18';
export const AGE_BANDS: AgeBand[] = ['12-14', '15-16', '17-18'];

export function bandForAge(age: number): AgeBand {
  if (age <= 14) return '12-14';
  if (age <= 16) return '15-16';
  return '17-18';
}

export type ScreenType =
  | 'hook' | 'explain' | 'interact' | 'decide' | 'feedback' | 'practice';

export const SCREEN_ORDER: ScreenType[] = [
  'hook', 'explain', 'interact', 'decide', 'feedback', 'practice',
];

/** Dark screens are a scarce device: hook and feedback only (Section 2). */
export const DARK_SCREENS: ScreenType[] = ['hook', 'feedback'];

export type MechanicType =
  | 'choice-fastforward'   // J1  Buy It Now, or Wait?
  | 'compare-income'       // J2  Two Ways to Get Paid
  | 'allocate-events'      // J3  Can You Survive the Month?
  | 'flow-trace'           // J4  Follow the Rs 500
  | 'parallel-shock'       // J5  The Rainy Day Test
  | 'emi-slider'           // J6  What Does This Loan Really Cost?
  | 'compound-curve'       // J7  Watch Rs 10,000 Grow
  | 'allocate-portfolio'   // J8  Pick Your Risk
  | 'match-goal'           // J9  Match the Goal
  | 'goal-planner'         // J10 Your Money Map
  | 'spot-scam';           // J11 Spot the Scam

export type MasteryState =
  | 'introduced' | 'practicing' | 'understood' | 'applied' | 'mastered';

export const MASTERY_ORDER: MasteryState[] = [
  'introduced', 'practicing', 'understood', 'applied', 'mastered',
];

/* ---------------- screen shapes ---------------- */

/** Inline emphasis is expressed as **bold** and parsed at render time. */
export type RichText = string;

export interface HookCopy {
  kicker: RichText;
  headline: RichText;
  /** Short supporting lines. `accent: true` renders in the marigold callout tone. */
  lines: { text: RichText; accent?: boolean }[];
  cta: string;
}

export interface ExplainCopy {
  kicker: RichText;
  headline: RichText;
  body: RichText[];
  cta: string;
}

/** Interact copy is chrome only — the mechanic itself is driven by `params`. */
export interface InteractCopy {
  kicker: RichText;
  headline: RichText;
  /** Optional label overrides for the mechanic's own controls and readouts. */
  labels?: Record<string, string>;
  cta?: string;
}

export interface DecideOption {
  id: string;
  title: RichText;
  subtitle?: RichText;
  /** Monospaced figure line, e.g. "Rs 9,822 / month". */
  figure?: RichText;
}

export interface DecideCopy {
  kicker: RichText;
  headline: RichText;
  options: DecideOption[];
  cta: string;
}

export interface Verdict {
  /** `tone` drives colour only. A choice is never scored right/wrong here —
   *  Decide shows a consequence, not a grade (Section 5). */
  tone: 'cost' | 'good';
  title: RichText;
  body: RichText;
}

export interface FeedbackCopy {
  kicker: RichText;
  /** Keyed by DecideOption.id. Every option must have a verdict. */
  verdicts: Record<string, Verdict>;
  myth: {
    /** The false belief, rendered struck through. */
    struck: RichText;
    /** What is actually true. */
    correction: RichText;
  };
  /** Vocabulary is introduced here and nowhere earlier (Section 5). */
  vocab: { term: string; definition: RichText };
  cta: string;
}

export interface PracticeOption {
  id: string;
  title: RichText;
  subtitle?: RichText;
  correct: boolean;
  /** Shown after answering. Explains the reasoning, not just correctness. */
  rationale: RichText;
}

export interface PracticeCopy {
  kicker: RichText;
  /** Must use a DIFFERENT context than the Interact screen (Section 5). */
  prompt: RichText;
  options: PracticeOption[];
  cta: string;
}

export interface ScreenCopy {
  hook: HookCopy;
  explain: ExplainCopy;
  interact: InteractCopy;
  decide: DecideCopy;
  feedback: FeedbackCopy;
  practice: PracticeCopy;
}

/* ---------------- age variants ---------------- */

/**
 * Same misconception, same interaction, same screen structure —
 * different numbers and framing (Section 6). Never a duplicate content tree.
 */
export interface AgeVariant {
  params: Record<string, unknown>;
  copy: ScreenCopy;
}

export interface Experience {
  id: string;
  journeyId: string;
  slug: string;
  title: string;
  mechanicType: MechanicType;
  isCore: boolean;
  /** Concept slugs this experience teaches. */
  concepts: string[];
  /** Bands this experience is available to. Credit + deep Investing gate to 15+. */
  availableTo: AgeBand[];
  ageVariants: Partial<Record<AgeBand, AgeVariant>>;
  /** Section 18: facts that go stale (tax slabs, rates, insurance limits). */
  timeSensitive?: boolean;
  verifiedAsOf?: string;
}

export interface Journey {
  id: string;
  slug: string;
  title: string;
  /** Short label for the lesson-player top bar. */
  shortTitle: string;
  orderIndex: number;
  /** Denomination token name, e.g. 'n2000'. Drives the strip segment colour. */
  colorToken: DenominationToken;
  estimatedMinutes: number;
}

export type DenominationToken =
  | 'n10' | 'n20' | 'n50' | 'n100' | 'n200' | 'n500' | 'n2000';

export interface Concept {
  slug: string;
  title: string;
  /** Only core concepts get the 5-state mastery machine (Section 8). */
  isCoreConcept: boolean;
}

/** Spaced retrieval: a Quick Check pulled from a PREVIOUS journey (Section 5). */
export interface QuickCheck {
  id: string;
  /** The journey this question is drawn FROM. */
  sourceJourneyId: string;
  conceptSlug: string;
  prompt: RichText;
  options: PracticeOption[];
}

/* ---------------- placeholder handling ---------------- */

export const PLACEHOLDER_PREFIX = '[PLACEHOLDER]';

export function isPlaceholderText(v: unknown): boolean {
  return typeof v === 'string' && v.startsWith(PLACEHOLDER_PREFIX);
}

/** True if any copy string in the variant is still a placeholder. */
export function variantHasPlaceholders(variant: AgeVariant): boolean {
  let found = false;
  const walk = (node: unknown) => {
    if (found) return;
    if (isPlaceholderText(node)) { found = true; return; }
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node && typeof node === 'object') { Object.values(node).forEach(walk); }
  };
  walk(variant.copy);
  return found;
}

export function stripPlaceholder(v: string): string {
  return v.startsWith(PLACEHOLDER_PREFIX)
    ? v.slice(PLACEHOLDER_PREFIX.length).trim()
    : v;
}
