'use client';

import { useId, useState } from 'react';
import { compound, inr, realValue } from '@/lib/money';
import { useSliderTick } from '@/lib/audio/useSliderTick';
import type { MechanicProps } from '@/content/types';
import type { CompoundCurveParams } from '@/content/experiences/j07-math';

/** Engagement bar (MechanicProps): the rate or start-age slider has moved
 *  at least once — either one is enough, since both redraw the curve. */
export default function CompoundCurve({
  params, labels, onExplored,
}: MechanicProps & { params: CompoundCurveParams }) {
  const uid = useId();
  const [rate, setRate] = useState(params.rate.default);
  const [startAge, setStartAge] = useState(params.startAge.default);
  const [touched, setTouched] = useState(false);
  const tickRate = useSliderTick(params.rate.min, params.rate.max);
  const tickStartAge = useSliderTick(params.startAge.min, params.startAge.max);

  const years = params.untilAge - startAge;
  const finalValue = compound(params.principal, rate, years);
  const realFinal = realValue(finalValue, params.inflation, years);

  const touch = () => { if (!touched) { setTouched(true); onExplored(); } };
  const L = (k: string, fallback: string) => (labels?.[k] ?? fallback).replace('{{untilAge}}', String(params.untilAge));

  // Build a light SVG curve: sample the balance every year from startAge to untilAge.
  const W = 300, H = 90;
  const points: string[] = [];
  for (let age = startAge; age <= params.untilAge; age++) {
    const v = compound(params.principal, rate, age - startAge);
    const x = ((age - startAge) / years) * W;
    const y = H - (v / finalValue) * H;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <div>
      <div className="ctrl">
        <div className="lab">
          <label htmlFor={`${uid}-rate`}>{L('rate', 'Return rate')}</label>
          <b>{rate}%</b>
        </div>
        <input
          id={`${uid}-rate`} type="range"
          min={params.rate.min} max={params.rate.max} step={params.rate.step}
          value={rate}
          onChange={(e) => { const v = +e.target.value; setRate(v); tickRate(v); touch(); }}
          aria-valuetext={`${rate} percent`}
        />
      </div>

      <div className="ctrl">
        <div className="lab">
          <label htmlFor={`${uid}-age`}>{L('startAge', 'Start age')}</label>
          <b>{startAge}</b>
        </div>
        <input
          id={`${uid}-age`} type="range"
          min={params.startAge.min} max={params.startAge.max} step={params.startAge.step}
          value={startAge}
          onChange={(e) => { const v = +e.target.value; setStartAge(v); tickStartAge(v); touch(); }}
          aria-valuetext={`starting at age ${startAge}`}
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', marginTop: 4 }}
        role="img" aria-label={`Growth curve from age ${startAge} to ${params.untilAge}`}
      >
        <polyline points={points.join(' ')} fill="none" stroke="var(--indigo)" strokeWidth="2.5" />
      </svg>

      <div className="readout">
        <div className="readline hero">
          <span>{L('finalLabel', `By age ${params.untilAge}`)}</span>
          <b>{inr(finalValue)}</b>
        </div>
        <div className="readline">
          <span>{L('realLabel', "What that's worth today")}</span>
          <b>{inr(realFinal)}</b>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Starting at {startAge} with a {rate} percent return, {inr(params.principal)} becomes {inr(finalValue)} by
        age {params.untilAge} — worth about {inr(realFinal)} in today's money after inflation.
      </p>
    </div>
  );
}
