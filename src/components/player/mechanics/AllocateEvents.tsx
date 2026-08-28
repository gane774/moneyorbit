'use client';

import { inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { AllocateParams } from '@/content/experiences/j03-budgeting';

/** Rounder steps for a bigger pool keep the tap count sane on a phone —
 *  every authored suggested split divides evenly by the step for its band. */
function stepFor(pool: number): number {
  if (pool <= 1_000) return 20;
  if (pool <= 5_000) return 100;
  return 500;
}

/**
 * Engagement bar (MechanicProps): the whole pool has been assigned, i.e.
 * remaining hits zero. Categories start at zero on purpose — a pre-filled
 * split would let a student reach "explored" without doing anything, the
 * same unlock-for-free bug the DOM heuristic had. `onExplored` fires every
 * time an edit lands on exactly zero remaining, and stays fired even if a
 * later edit moves money back out of balance.
 */
export default function AllocateEvents({
  params,
  labels,
  onExplored,
  allocation,
  onAllocationChange,
}: MechanicProps & {
  params: AllocateParams;
  allocation: Record<string, number>;
  onAllocationChange: (next: Record<string, number>) => void;
}) {
  const step = stepFor(params.pool);
  const allocated = params.categories.reduce((sum, c) => sum + (allocation[c.id] ?? 0), 0);
  const remaining = params.pool - allocated;
  const pct = Math.min(100, Math.round((allocated / params.pool) * 100));

  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;

  const setAmount = (id: string, next: number) => {
    const updated = { ...allocation, [id]: next };
    onAllocationChange(updated);
    const nowAllocated = params.categories.reduce((sum, c) => sum + (updated[c.id] ?? 0), 0);
    if (params.pool - nowAllocated === 0) onExplored();
  };

  const bump = (id: string, dir: 1 | -1) => {
    const current = allocation[id] ?? 0;
    if (dir === 1) {
      setAmount(id, current + Math.min(step, remaining));
    } else {
      setAmount(id, Math.max(0, current - step));
    }
  };

  const useReferenceSplit = () => {
    const reference = Object.fromEntries(params.categories.map((c) => [c.id, c.suggested]));
    onAllocationChange(reference);
    onExplored();
  };

  return (
    <div>
      <div className="alloc-hero">
        <span>{L('remaining', 'Left to allocate')}</span>
        <b className={remaining === 0 ? 'done' : ''}>{inr(remaining)}</b>
      </div>

      <div className="stackbar" aria-hidden="true">
        <div style={{ width: `${pct}%`, background: 'var(--indigo)', transition: 'width .2s ease' }} />
        <div style={{ width: `${100 - pct}%`, background: 'var(--ink-12)', transition: 'width .2s ease' }} />
      </div>

      <div style={{ marginTop: 10 }}>
        {params.categories.map((c) => {
          const value = allocation[c.id] ?? 0;
          const atMax = value >= params.pool - (allocated - value);
          return (
            <div className="alloc-row" key={c.id}>
              <div className="al">
                <span className="at">{c.label}</span>
                {c.essential && <span className="ae">{L('essential', 'Hard to skip')}</span>}
              </div>
              <div className="stepper">
                <button
                  type="button"
                  aria-label={`Decrease ${c.label}`}
                  disabled={value === 0}
                  onClick={() => bump(c.id, -1)}
                >
                  −
                </button>
                <span className="av">{inr(value)}</span>
                <button
                  type="button"
                  aria-label={`Increase ${c.label}`}
                  disabled={remaining === 0 && !atMax}
                  onClick={() => bump(c.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {allocated === 0 && (
        <button className="btn ghost" style={{ marginTop: 16 }} type="button" onClick={useReferenceSplit}>
          Use the reference split
        </button>
      )}

      <p className="sr-only" aria-live="polite">
        {inr(allocated)} of {inr(params.pool)} allocated, {inr(remaining)} left.
      </p>
    </div>
  );
}
