'use client';

import { MASTERY_ORDER, type AgeBand, type MasteryState } from '@/content/types';
import { isCoreConcept } from '@/content/concepts';

/**
 * Local-first progress. Everything here is mirrored to Supabase when a
 * session exists (see lib/sync.ts); localStorage is the source of truth
 * for an interrupted lesson so a refresh resumes rather than restarting
 * (Section 21, edge cases).
 */

const KEY = 'moneyorbit.progress.v1';

export interface ResumeState {
  screenIndex: number;
  decision: string | null;
}

export interface ProgressState {
  studentId: string | null;
  username: string;
  fullName: string;
  age: number | null;
  ageBand: AgeBand;
  /** Journey slugs completed. */
  completed: string[];
  /** Per-experience resume points, keyed by journey slug. */
  resume: Record<string, ResumeState>;
  /** Only core concepts get the 5-state machine (Section 8). */
  mastery: Record<string, MasteryState>;
  /** Non-core concepts: complete / incomplete. */
  touched: string[];
  startedAt: string | null;
  completedAt: string | null;
}

export const EMPTY: ProgressState = {
  studentId: null,
  username: '',
  fullName: '',
  age: null,
  ageBand: '15-16',
  completed: [],
  resume: {},
  mastery: {},
  touched: [],
  startedAt: null,
  completedAt: null,
};

export function load(): ProgressState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<ProgressState>) };
  } catch {
    // Private mode, cleared storage, or corrupt JSON — start clean rather than crash.
    return EMPTY;
  }
}

export function save(p: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — the session still works, it just will not resume */
  }
}

export function update(fn: (p: ProgressState) => ProgressState): ProgressState {
  const next = fn(load());
  save(next);
  return next;
}

export function clear(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch { /* no-op */ }
}

/* ---------------- mastery ---------------- */

function rank(s: MasteryState): number {
  return MASTERY_ORDER.indexOf(s);
}

/** Mastery only ever moves forward. */
export function advanceMastery(
  p: ProgressState,
  conceptSlug: string,
  to: MasteryState,
): ProgressState {
  if (!isCoreConcept(conceptSlug)) {
    return p.touched.includes(conceptSlug)
      ? p
      : { ...p, touched: [...p.touched, conceptSlug] };
  }
  const cur = p.mastery[conceptSlug];
  if (cur && rank(cur) >= rank(to)) return p;
  return { ...p, mastery: { ...p.mastery, [conceptSlug]: to } };
}

export function advanceMany(
  p: ProgressState,
  conceptSlugs: string[],
  to: MasteryState,
): ProgressState {
  return conceptSlugs.reduce((acc, c) => advanceMastery(acc, c, to), p);
}

/** 0-5, for the competency dots on the progress screen. */
export function masteryDots(p: ProgressState, conceptSlugs: string[]): number {
  const core = conceptSlugs.filter(isCoreConcept);
  if (core.length === 0) return 0;
  const total = core.reduce((sum, c) => {
    const st = p.mastery[c];
    return sum + (st ? rank(st) + 1 : 0);
  }, 0);
  return Math.round(total / core.length);
}

/** True if the student has not started anything — used to avoid rendering
 *  a discouraging row of empty circles (Section 8). */
export function hasAttempted(p: ProgressState, conceptSlugs: string[]): boolean {
  return conceptSlugs.some((c) => p.mastery[c] || p.touched.includes(c));
}
