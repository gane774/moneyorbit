'use client';

import { useState } from 'react';
import { inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { CompareIncomeParams } from '@/content/experiences/j02-earning';

/** Engagement bar (MechanicProps): the exam-week test has been run — a
 *  stronger bar than "both cards seen," since the button sits below them. */
export default function CompareIncome({
  params, labels, onExplored,
}: MechanicProps & { params: CompareIncomeParams }) {
  const [examWeek, setExamWeek] = useState(false);

  const kabirMonthly = params.active.hourlyRate * params.active.hoursPerWeek * params.active.weeksPerMonth;
  const zaraMonthly = (params.passive.principal * params.passive.ratePct) / 100 / 12;

  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;
  const T = (s: string) => s
    .replace('{{kabirHours}}', String(params.active.hoursPerWeek))
    .replace('{{kabirRate}}', inr(params.active.hourlyRate))
    .replace('{{kabirWeeks}}', String(params.active.weeksPerMonth))
    .replace('{{zaraPrincipal}}', inr(params.passive.principal))
    .replace('{{zaraRate}}', `${params.passive.ratePct}%`)
    .replace('{{kabirName}}', params.active.name)
    .replace('{{zaraName}}', params.passive.name);

  return (
    <div>
      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="readline hero">
          <span>{params.active.name} — active income</span>
          <b style={{ color: examWeek ? 'var(--danger)' : undefined }}>
            {inr(examWeek ? 0 : kabirMonthly)}
          </b>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-60)', marginTop: -4 }}>
          {examWeek ? `${params.active.name} tutors nobody this week — exams.` : T(L('activeLine', ''))}
        </p>
      </div>

      <div className="readout">
        <div className="readline hero">
          <span>{params.passive.name} — passive income</span>
          <b style={{ color: examWeek ? 'var(--good)' : undefined }}>{inr(zaraMonthly)}</b>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-60)', marginTop: -4 }}>
          {T(L('passiveLine', ''))}
        </p>
        {!examWeek && (
          <p style={{ fontSize: 12.5, color: 'var(--ink-35)', marginTop: 6 }}>
            {L('passiveExplainer', '')}
          </p>
        )}
      </div>

      <button
        className="btn ghost"
        type="button"
        style={{ marginTop: 14 }}
        disabled={examWeek}
        onClick={() => { setExamWeek(true); onExplored(); }}
      >
        {examWeek ? 'Both have board exams this week' : L('examButton', 'Exam week — no extra work happens')}
      </button>

      <p className="sr-only" aria-live="polite">
        {examWeek
          ? `During exam week, ${params.active.name}'s income drops to zero. ${params.passive.name}'s stays at ${inr(zaraMonthly)}.`
          : 'Run exam week to see what happens to each income when neither person does extra work.'}
      </p>
    </div>
  );
}
