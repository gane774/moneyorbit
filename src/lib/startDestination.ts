'use client';

import { JOURNEYS } from '@/content/journeys';
import { EXPERIENCES, isAvailable } from '@/content/experiences';
import * as P from '@/lib/progress';

/**
 * Where "Start learning" should actually send this particular visitor
 * (Section 13). The CTA must never be a dead end, and it must never send a
 * returning student back to the beginning of something they have finished.
 *
 * Today "signed in" means a completed onboarding held in localStorage. When
 * real accounts land this function is the single place that has to change --
 * every CTA already routes through it rather than hardcoding /onboarding.
 */
export function resolveStartDestination(): { href: string; label: string } {
  const p = P.load();

  // No identity yet: onboarding is the only sensible first step.
  if (!p.username) {
    return { href: '/onboarding', label: 'Start your MoneyOrbit' };
  }

  // Only count journeys this student can actually open — J6 and J8 are gated
  // to 15+, so a 13-year-old must not be told to "continue" into one, and
  // must still be able to reach "finished" without them.
  const openToThem = JOURNEYS.filter((j) => {
    const exp = EXPERIENCES.find((e) => e.journeyId === j.id);
    return exp ? isAvailable(exp, p.ageBand) : false;
  });

  const firstUnfinished = openToThem.find((j) => !p.completed.includes(j.slug));

  // Everything available to them is done: send them somewhere new rather than
  // looping them back through the course.
  if (!firstUnfinished) {
    return { href: '/lab', label: 'Explore Money Lab' };
  }

  const isMidway = Boolean(p.resume[firstUnfinished.slug]) || p.completed.length > 0;
  return {
    href: `/learn/${firstUnfinished.slug}`,
    label: isMidway ? `Continue — ${firstUnfinished.title}` : 'Start your MoneyOrbit',
  };
}
