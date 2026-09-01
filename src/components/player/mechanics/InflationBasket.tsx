'use client';

import { useId, useState } from 'react';
import { inr, compound, realValue } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { InflationParams } from '@/content/experiences/j01-inflation';

/**
 * Journey 1 — inflation, in three shapes.
 *
 * One component, three modes, because the three bands ask genuinely different
 * questions of the same idea: what is happening (a shrinking basket), why it
 * happens (a rate applied over years), and how it changes a decision (real
 * versus nominal return).
 *
 * Engagement bar: a slider has moved, or both baskets have been seen.
 */
export default function InflationBasket({ params, labels, onExplored }: MechanicProps & { params: InflationParams }) {
  const uid = useId();
  const L = (k: string, f: string) => labels?.[k] ?? f;

  const [year, setYear] = useState(0);
  const [rate, setRate] = useState(params.rate?.default ?? 6);
  const [years, setYears] = useState(params.years?.default ?? 5);
  const [touched, setTouched] = useState(false);
  const touch = () => { if (!touched) { setTouched(true); onExplored(); } };

  /* ---------------- 12-14: the shrinking basket ---------------- */
  if (params.mode === 'basket') {
    const pocket = params.pocket ?? 100;
    const span = params.yearsAgo ?? 5;
    const items = params.items ?? [];
    /* Interpolate between the old and current price so the slider reads as
       time passing rather than a two-state toggle. */
    const t = year / span;
    const priceAt = (it: { thenPrice: number; nowPrice: number }) =>
      it.thenPrice + (it.nowPrice - it.thenPrice) * t;

    return (
      <div>
        <div className="ctrl">
          <div className="lab">
            <label htmlFor={`${uid}-y`}>{L('slider', 'Years')}</label>
            <b>{year === 0 ? L('then', `${span} years ago`) : year === span ? L('now', 'Today') : `${span - year} years ago`}</b>
          </div>
          <input id={`${uid}-y`} type="range" min={0} max={span} step={1} value={year}
            onChange={(e) => { setYear(+e.target.value); touch(); }}
            aria-valuetext={year === span ? 'today' : `${span - year} years ago`} />
        </div>

        <div className="readout">
          <div style={{ fontSize: 12.5, color: 'var(--ink-60)', marginBottom: 8 }}>
            {L('buys', `What ${inr(pocket)} buys`)}
          </div>
          {items.map((it) => {
            const price = priceAt(it);
            const count = Math.floor(pocket / price);
            return (
              <div className="readline" key={it.label}>
                <span>{it.label} <span className="ae" style={{ marginLeft: 6 }}>{inr(Math.round(price))} each</span></span>
                <b style={{ color: count < Math.floor(pocket / it.thenPrice) ? 'var(--danger)' : undefined }}>
                  {count}
                </b>
              </div>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {year === 0 ? 'Prices five years ago.' : year === span ? "Today's prices — the same money buys fewer of each." : 'Prices partway through.'}
        </p>
      </div>
    );
  }

  /* ---------------- 15-16: purchasing power over time ---------------- */
  if (params.mode === 'purchasing-power') {
    const amount = params.amount ?? 10_000;
    const real = realValue(amount, rate, years);
    const lostPct = Math.round((1 - real / amount) * 100);

    return (
      <div>
        <div className="ctrl">
          <div className="lab"><label htmlFor={`${uid}-r`}>{L('rate', 'Inflation rate')}</label><b>{rate}%</b></div>
          <input id={`${uid}-r`} type="range" min={params.rate!.min} max={params.rate!.max} step={params.rate!.step}
            value={rate} onChange={(e) => { setRate(+e.target.value); touch(); }} aria-valuetext={`${rate} percent`} />
        </div>
        <div className="ctrl">
          <div className="lab"><label htmlFor={`${uid}-yy`}>{L('years', 'Years untouched')}</label><b>{years}</b></div>
          <input id={`${uid}-yy`} type="range" min={params.years!.min} max={params.years!.max} step={params.years!.step}
            value={years} onChange={(e) => { setYears(+e.target.value); touch(); }} aria-valuetext={`${years} years`} />
        </div>

        <div className="readout">
          <div className="readline"><span>{L('nominal', 'Still in your account')}</span><b>{inr(amount)}</b></div>
          <div className="stackbar" aria-hidden="true">
            <div style={{ width: `${(real / amount) * 100}%`, background: 'var(--indigo)', transition: 'width .25s ease' }} />
            <div style={{ width: `${100 - (real / amount) * 100}%`, background: 'var(--danger)', transition: 'width .25s ease' }} />
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--indigo)' }} />Still buys</span>
            <span><i style={{ background: 'var(--danger)' }} />Quietly lost</span>
          </div>
          <div className="readline hero"><span>{L('real', 'What it can actually buy')}</span><b>{inr(real)}</b></div>
          <div className="readline"><span>{L('lost', 'Quietly lost')}</span><b>{lostPct}%</b></div>
        </div>
        <p className="sr-only" aria-live="polite">
          At {rate} percent for {years} years, {inr(amount)} buys what {inr(real)} buys today — {lostPct} percent less.
        </p>
      </div>
    );
  }

  /* ---------------- 17-18: real vs nominal ---------------- */
  const amount = params.amount ?? 100_000;
  return (
    <div>
      <div className="ctrl">
        <div className="lab"><label htmlFor={`${uid}-ri`}>{L('rate', 'Inflation rate')}</label><b>{rate}%</b></div>
        <input id={`${uid}-ri`} type="range" min={params.rate!.min} max={params.rate!.max} step={params.rate!.step}
          value={rate} onChange={(e) => { setRate(+e.target.value); touch(); }} aria-valuetext={`${rate} percent`} />
      </div>
      <div className="ctrl">
        <div className="lab"><label htmlFor={`${uid}-ry`}>{L('years', 'Over')}</label><b>{years} years</b></div>
        <input id={`${uid}-ry`} type="range" min={params.years!.min} max={params.years!.max} step={params.years!.step}
          value={years} onChange={(e) => { setYears(+e.target.value); touch(); }} aria-valuetext={`${years} years`} />
      </div>

      <div className="readout">
        {(params.instruments ?? []).map((ins) => {
          const realRate = ins.nominal - rate;
          const grown = compound(amount, ins.nominal, years);
          const worth = realValue(grown, rate, years);
          const ahead = realRate > 0;
          return (
            <div key={ins.label} style={{ padding: '10px 0', borderBottom: '1px solid var(--ink-12)' }}>
              <div className="readline" style={{ padding: 0 }}>
                <span>{ins.label}</span>
                <b style={{ color: ahead ? 'var(--good)' : 'var(--danger)' }}>
                  {realRate > 0 ? '+' : ''}{realRate.toFixed(1)}% real
                </b>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-60)', marginTop: 3 }}>
                {ins.nominal}% nominal → {inr(grown)} · worth {inr(worth)} in today&rsquo;s money
              </div>
            </div>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        At {rate} percent inflation, instruments below that rate lose purchasing power.
      </p>
    </div>
  );
}
