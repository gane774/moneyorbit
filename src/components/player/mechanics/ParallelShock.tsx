'use client';

import { useState } from 'react';
import { inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { ParallelShockParams } from '@/content/experiences/j05-saving';

/** Engagement bar (MechanicProps): the shock has been run for both students. */
export default function ParallelShock({
  params, labels, onExplored,
}: MechanicProps & { params: ParallelShockParams }) {
  const [revealed, setRevealed] = useState(false);
  const remaining = params.withFund.savings - params.shockAmount;
  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;

  return (
    <div>
      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="readline hero">
          <span>{params.withFund.name}</span>
          <b>{inr(params.shockAmount)} bill</b>
        </div>
        {!revealed && <p style={{ fontSize: 12.5, color: 'var(--ink-60)' }}>Has {inr(params.withFund.savings)} saved.</p>}
        {revealed && (
          <p style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5 }}>
            Pays instantly from savings — down to <b>{inr(remaining)}</b>, back on the road the same day.
            Rebuilds the cushion at {inr(params.withFund.weeklyRebuild)}/week.
          </p>
        )}
      </div>

      <div className="readout">
        <div className="readline hero">
          <span>{params.withoutFund.name}</span>
          <b style={{ color: revealed ? 'var(--danger)' : undefined }}>{inr(params.shockAmount)} bill</b>
        </div>
        {!revealed && <p style={{ fontSize: 12.5, color: 'var(--ink-60)' }}>Has {inr(0)} saved.</p>}
        {revealed && (
          <p style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5 }}>
            Has to borrow {inr(params.shockAmount)} from a friend, or wait a week for family to spare it —
            missing school days either way, and now owing someone.
          </p>
        )}
      </div>

      <button
        className="btn ghost"
        type="button"
        style={{ marginTop: 14 }}
        disabled={revealed}
        onClick={() => { setRevealed(true); onExplored(); }}
      >
        {revealed ? L('reveal', 'One week later') : L('run', 'Run the week')}
      </button>

      <p className="sr-only" aria-live="polite">
        {revealed
          ? `${params.withFund.name} pays instantly and moves on. ${params.withoutFund.name} has to borrow or wait.`
          : 'Run the week to see how each student handles the same bill.'}
      </p>
    </div>
  );
}
