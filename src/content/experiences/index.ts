import type { AgeBand, Experience } from '../types';
import { j06Credit } from './j06-credit';
import { PLACEHOLDER_EXPERIENCES } from './placeholders';

export const EXPERIENCES: Experience[] = [
  ...PLACEHOLDER_EXPERIENCES,
  j06Credit,
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

export { j06Credit };
