import type { AgeBand, Experience } from '../types';
import { J03_BUDGETING } from './j03-budgeting';
import { j06Credit } from './j06-credit';
import { PLACEHOLDER_EXPERIENCES } from './placeholders';

/**
 * Authored experiences win over their placeholder of the same id, so a real
 * lesson can land one at a time without editing placeholders.ts.
 */
const AUTHORED: Experience[] = [J03_BUDGETING, j06Credit];
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

export { j06Credit, J03_BUDGETING };
