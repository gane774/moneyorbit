import type { AgeBand, Experience } from '../types';
import { J01_MINDSET } from './j01-mindset';
import { J02_EARNING } from './j02-earning';
import { J04_BANKING } from './j04-banking';
import { J05_SAVING } from './j05-saving';
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
  J01_MINDSET, J02_EARNING, J03_BUDGETING, J04_BANKING, J05_SAVING, j06Credit, J07_MATH, J08_INVESTING,
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
  j06Credit, J01_MINDSET, J02_EARNING, J03_BUDGETING, J04_BANKING, J05_SAVING, J07_MATH, J08_INVESTING,
  J09_DESTINATIONS, J10_PLANNING, J11_FINAL,
};
