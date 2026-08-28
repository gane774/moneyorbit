'use client';

import { useId, useState } from 'react';
import { computeLoan, inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { EmiParams } from '@/content/experiences/j06-credit';

/**
 * Journey 6 — the highest-value four minutes in the product.
 * Indigo is always principal, red is always interest. That pairing recurs
 * in the credit-card lesson and again in compounding; it is doing teaching
 * work, not decoration.
 */
/** Engagement bar (MechanicProps): any slider has moved once. Seeing the
 *  interest bar react to a change IS the lesson, so one movement is enough. */
export default function EmiSlider({
  params,
  labels,
  onExplored,
}: MechanicProps & { params: EmiParams }) {
  const uid = useId();
  const [amount, setAmount] = useState(params.amount.default);
  const [rate, setRate] = useState(params.rate.default);
  const [years, setYears] = useState(params.years.default);
  const [touched, setTouched] = useState(false);

  const loan = computeLoan(amount, rate, years);

  const touch = () => {
    if (!touched) {
      setTouched(true);
      onExplored();
    }
  };

  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;

  return (
    <div>
      <div className="ctrl">
        <div className="lab">
          <label htmlFor={`${uid}-amt`}>{L('amount', 'Loan amount')}</label>
          <b>{inr(amount)}</b>
        </div>
        <input
          id={`${uid}-amt`}
          type="range"
          min={params.amount.min}
          max={params.amount.max}
          step={params.amount.step}
          value={amount}
          onChange={(e) => { setAmount(+e.target.value); touch(); }}
          aria-valuetext={inr(amount)}
        />
      </div>

      <div className="ctrl">
        <div className="lab">
          <label htmlFor={`${uid}-rate`}>{L('rate', 'Interest rate')}</label>
          <b>{rate}%</b>
        </div>
        <input
          id={`${uid}-rate`}
          type="range"
          min={params.rate.min}
          max={params.rate.max}
          step={params.rate.step}
          value={rate}
          onChange={(e) => { setRate(+e.target.value); touch(); }}
          aria-valuetext={`${rate} percent`}
        />
      </div>

      <div className="ctrl">
        <div className="lab">
          <label htmlFor={`${uid}-yr`}>{L('years', 'Repay over')}</label>
          <b>{years} {years === 1 ? 'year' : 'years'}</b>
        </div>
        <input
          id={`${uid}-yr`}
          type="range"
          min={params.years.min}
          max={params.years.max}
          step={params.years.step}
          value={years}
          onChange={(e) => { setYears(+e.target.value); touch(); }}
          aria-valuetext={`${years} years`}
        />
      </div>

      <div className="readout">
        <div className="readline">
          <span>{L('emi', 'You pay each month')}</span>
          <b>{inr(loan.emi)}</b>
        </div>

        <div className="stackbar" aria-hidden="true">
          <div className="p" style={{ width: `${loan.principalPct}%` }} />
          <div className="i" style={{ width: `${100 - loan.principalPct}%` }} />
        </div>

        <div className="legend">
          <span><i style={{ background: 'var(--indigo)' }} />{L('principalLegend', 'What you borrowed')}</span>
          <span><i style={{ background: 'var(--danger)' }} />{L('interestLegend', 'Extra you pay')}</span>
        </div>

        <div className="readline hero" style={{ marginTop: 8 }}>
          <span>{L('interest', 'Extra you pay')}</span>
          <b>{inr(loan.totalInterest)}</b>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Borrowing {inr(amount)} at {rate} percent over {years} years costs {inr(loan.emi)} each
        month, and {inr(loan.totalInterest)} extra in total.
      </p>
    </div>
  );
}
