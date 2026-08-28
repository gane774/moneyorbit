import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProgressState } from '@/lib/progress';

// progress.ts is a client module that reads localStorage; provide a minimal one.
const store: Record<string, string> = {};
vi.stubGlobal('window', {
  localStorage: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  },
});

const P = await import('@/lib/progress');

describe('mastery machine', () => {
  beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });

  it('advances forward through the five states', () => {
    let s: ProgressState = { ...P.EMPTY, mastery: {} };
    s = P.advanceMany(s, ['budgeting'], 'introduced');
    expect(s.mastery.budgeting).toBe('introduced');
    s = P.advanceMany(s, ['budgeting'], 'practicing');
    expect(s.mastery.budgeting).toBe('practicing');
    s = P.advanceMany(s, ['budgeting'], 'understood');
    expect(s.mastery.budgeting).toBe('understood');
  });

  it('never regresses a concept to an earlier state', () => {
    // Re-opening a finished lesson marks concepts "introduced" again; that
    // must not undo mastery the student already earned.
    let s: ProgressState = { ...P.EMPTY, mastery: {} };
    s = P.advanceMany(s, ['budgeting'], 'understood');
    s = P.advanceMany(s, ['budgeting'], 'introduced');
    expect(s.mastery.budgeting).toBe('understood');
  });

  it('survives corrupt stored JSON instead of crashing', () => {
    store['moneyorbit.progress.v1'] = '{not valid json';
    expect(() => P.load()).not.toThrow();
    expect(P.load().username).toBe('');
  });

  it('round-trips through save and load', () => {
    P.save({ ...P.EMPTY, username: 'x', completed: ['budgeting'] });
    expect(P.load().completed).toEqual(['budgeting']);
  });
});
