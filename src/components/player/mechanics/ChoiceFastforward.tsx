'use client';

import { useState } from 'react';
import { compound, inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { ChoiceFastforwardParams } from '@/content/experiences/j01-mindset';

/** Engagement bar (MechanicProps): the fast-forward has been run once. */
export default function ChoiceFastforward({
  params, labels, onExplored,
}: MechanicProps & { params: ChoiceFastforwardParams }) {
  const [picked, setPicked] = useState<'buy' | 'wait' | null>(null);
  const [revealed, setRevealed] = useState(false);

  const fv = compound(params.itemCost, params.rate, params.years);
  const L = (k: string, fallback: string) => (labels?.[k] ?? fallback).replace('{{years}}', String(params.years));

  return (
    <div>
      <div role="radiogroup" aria-label="Your instinct" style={{ marginBottom: 14 }}>
        {(['buy', 'wait'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={picked === id}
            className={`choice${picked === id ? ' sel' : ''}`}
            onClick={() => setPicked(id)}
          >
            <div className="ct">{id === 'buy' ? L('buy', 'Buy it now') : L('wait', 'Wait and grow')}</div>
          </button>
        ))}
      </div>

      <button
        className="btn ghost"
        type="button"
        disabled={!picked}
        onClick={() => { setRevealed(true); onExplored(); }}
      >
        {L('fastForward', `Fast-forward ${params.years} years`)}
      </button>

      {revealed && (
        <div className="readout" style={{ marginTop: 14 }}>
          <div className="readline">
            <span>{L('buyOutcome', 'If you bought it')}</span>
            <b>{inr(params.itemCost)} spent, {inr(0)} growing</b>
          </div>
          <div className="readline hero">
            <span>{L('waitOutcome', 'If you waited')}</span>
            <b>{inr(fv)}</b>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {revealed
          ? `Buying now spends ${inr(params.itemCost)}. Waiting ${params.years} years grows it to ${inr(fv)}.`
          : 'Pick an instinct, then fast-forward to see both outcomes.'}
      </p>
    </div>
  );
}
