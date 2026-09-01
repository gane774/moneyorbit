import type { AgeBand, Experience } from '../types';
import { J01_INFLATION } from './j01-inflation';
import { J02_CREDIT_SCORE } from './j02-credit-score';
import { J04_INVESTMENTS } from './j04-investments';
import { J05_BANKING } from './j05-banking';
import { J07_MATH } from './j07-math';
import { J08_INVESTING } from './j08-investing';
import { J09_DESTINATIONS } from './j09-destinations';
import { J10_PLANNING } from './j10-planning';
import { J11_FINAL } from './j11-final';
import { J03_BUDGETING } from './j03-budgeting';
import { j06Credit } from './j06-credit';
import { PLACEHOLDER_EXPERIENCES } from './placeholders';

/**
 * Authored experiences win over their placeholder of the same id, so a real
 * lesson can land one at a time without editing placeholders.ts.
 */
const AUTHORED: Experience[] = [
  J01_INFLATION, J02_CREDIT_SCORE, J03_BUDGETING, J04_INVESTMENTS, J05_BANKING, j06Credit, J07_MATH, J08_INVESTING,
  J09_DESTINATIONS, J10_PLANNING, J11_FINAL,
];
const AUTHORED_IDS = new Set(AUTHORED.map((e) => e.id));

export const EXPERIENCES: Experience[] = [
  ...PLACEHOLDER_EXPERIENCES.filter((e) => !AUTHORED_IDS.has(e.id)),
  ...AUTHORED,
].sort((a, b) => a.id.localeCompare(b.id));

export const EXPERIENCE_BY_JOURNEY = new Map(
  EXPERIENCES.map((e) => [e.journeyId, e]),
);

export function experienceForJourney(journeyId: string): Experience | undefined {
  return EXPERIENCE_BY_JOURNEY.get(journeyId);
}

/** An experience is available to a band only if it declares a variant for it. */
export function isAvailable(exp: Experience, band: AgeBand): boolean {
  return exp.availableTo.includes(band) && Boolean(exp.ageVariants[band]);
}

export function variantFor(exp: Experience, band: AgeBand) {
  return exp.ageVariants[band];
}

export {
  j06Credit, J01_INFLATION, J02_CREDIT_SCORE, J03_BUDGETING, J04_INVESTMENTS, J05_BANKING, J07_MATH, J08_INVESTING,
  J09_DESTINATIONS, J10_PLANNING, J11_FINAL,
};
