'use client';

import { useState } from 'react';
import type { MechanicProps } from '@/content/types';
import type { FlowTraceParams } from '@/content/experiences/j04-banking';

/** Engagement bar (MechanicProps): the trace has reached the final node. */
export default function FlowTrace({
  params, labels, onExplored,
}: MechanicProps & { params: FlowTraceParams }) {
  const [step, setStep] = useState(0);
  const isLast = step === params.steps.length - 1;
  const current = params.steps[step];

  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;

  const advance = () => {
    if (isLast) return;
    const next = step + 1;
    setStep(next);
    if (next === params.steps.length - 1) onExplored();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }} aria-hidden="true">
        {params.steps.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 99,
              background: i <= step ? 'var(--indigo)' : 'var(--ink-12)',
              transition: 'background .2s ease',
            }}
          />
        ))}
      </div>

      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="readline hero" style={{ display: 'block' }}>
          <b style={{ fontSize: 18 }}>{current.label}</b>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--ink-60)', marginTop: 4 }}>{current.detail}</p>
      </div>

      <button className="btn ghost" type="button" style={{ marginTop: 16 }} disabled={isLast} onClick={advance}>
        {isLast ? L('done', 'It landed') : `${L('next', 'Next step')} (${step + 1}/${params.steps.length})`}
      </button>

      <p className="sr-only" aria-live="polite">{current.label}. {current.detail}</p>
    </div>
  );
}
