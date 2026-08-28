'use client';

import { useState } from 'react';
import { inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { AllocatePortfolioParams, Bucket } from '@/content/experiences/j08-investing';

type RunResult = { bucketId: Bucket['id']; value: number };

/** One random annual return per year, compounded sequentially — a wide
 *  range like Risky (-10% to +25%) should feel genuinely unpredictable
 *  across five draws, not like a single dice roll smoothed into an average. */
function simulate(principal: number, years: number, min: number, max: number): number {
  let value = principal;
  for (let i = 0; i < years; i++) {
    const r = min + Math.random() * (max - min);
    value *= 1 + r / 100;
  }
  return value;
}

/** Engagement bar (MechanicProps): at least two runs completed, regardless
 *  of bucket — that's the minimum needed to see "same choice, different
 *  outcome" for yourself rather than being told about it. */
export default function AllocatePortfolio({
  params, labels, onExplored,
}: MechanicProps & { params: AllocatePortfolioParams }) {
  const [active, setActive] = useState<Bucket['id']>('safe');
  const [runs, setRuns] = useState<RunResult[]>([]);

  const activeBucket = params.buckets.find((b) => b.id === active)!;
  const runsForActive = runs.filter((r) => r.bucketId === active);

  const run = () => {
    const value = simulate(params.principal, params.years, activeBucket.minReturn, activeBucket.maxReturn);
    const next = [...runs, { bucketId: active, value }];
    setRuns(next);
    if (next.length >= 2) onExplored();
  };

  return (
    <div>
      <div role="radiogroup" aria-label="Bucket" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {params.buckets.map((b) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={active === b.id}
            className={`choice${active === b.id ? ' sel' : ''}`}
            style={{ marginBottom: 0, textAlign: 'center' }}
            onClick={() => setActive(b.id)}
          >
            <div className="ct" style={{ fontSize: 13.5 }}>{b.label}</div>
            <div className="cs">{b.minReturn}% to {b.maxReturn}%</div>
          </button>
        ))}
      </div>

      <button className="btn ghost" type="button" onClick={run}>
        {labels?.run ?? 'Run 5 years'}
      </button>

      {runsForActive.length > 0 && (
        <div className="readout">
          {runsForActive.map((r, i) => (
            <div className="readline" key={i}>
              <span>Run {i + 1}</span>
              <b>{inr(r.value)}</b>
            </div>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {runsForActive.length > 0
          ? `${activeBucket.label} run ${runsForActive.length}: ${inr(runsForActive[runsForActive.length - 1].value)}.`
          : `Run the ${activeBucket.label} bucket to see an outcome.`}
      </p>
    </div>
  );
}
