'use client';

import { useMemo, useState } from 'react';
import { shuffle } from '@/lib/shuffle';
import type { MechanicProps } from '@/content/types';
import type { PaymentDecisionParams } from '@/content/experiences/j04-banking';

/**
 * Banking decisions. Replaces the flow-trace, which showed how UPI routes a
 * payment -- accurate, and not a thing a student ever has to do.
 *
 * One situation at a time, each committed before the outcome is shown, so the
 * student is making a call rather than reading a list of tips. Options are
 * shuffled per case so the safe answer never settles into one position.
 *
 * Engagement bar (MechanicProps): every case decided. Getting them right is
 * not required -- being wrong here and reading why is the lesson.
 */
export default function PaymentDecisions({
  params, labels, onExplored,
}: MechanicProps & { params: PaymentDecisionParams }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const finished = index >= params.cases.length;
  const c = params.cases[index];

  const shown = useMemo(
    () => (c ? shuffle(c.options) : []),
    [c],
  );

  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;
  const chosenId = c ? answers[c.id] : undefined;
  const chosen = chosenId ? c.options.find((o) => o.id === chosenId) : undefined;

  const advance = () => {
    const next = index + 1;
    setIndex(next);
    if (next >= params.cases.length) onExplored();
  };

  if (finished) {
    const safeCount = params.cases.filter((x) =>
      x.options.find((o) => o.id === answers[x.id])?.safe).length;
    return (
      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="readline hero">
          <span>Safe choices</span>
          <b>{safeCount} of {params.cases.length}</b>
        </div>
      </div>
    );
  }

  const channelLabel = { message: 'Message', call: 'Phone call', app: 'In your app' }[c.channel];

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }} aria-hidden="true">
        {params.cases.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i < index ? 'var(--indigo)' : i === index ? 'var(--ink-35)' : 'var(--ink-12)',
          }} />
        ))}
      </div>

      <div className="goalCard">
        <div className="goalKicker">{channelLabel}</div>
        <div className="goalName" style={{ fontSize: 'clamp(17px,4vw,21px)' }}>{c.situation}</div>
        <div className="goalAsk" style={{ fontStyle: 'italic' }}>{c.detail}</div>
      </div>

      {!chosen ? (
        shown.map((o) => (
          <button
            key={o.id}
            type="button"
            className="choice"
            onClick={() => setAnswers({ ...answers, [c.id]: o.id })}
          >
            <div className="ct">{o.label}</div>
          </button>
        ))
      ) : (
        <>
          <div className={`choice ${chosen.safe ? 'correct' : 'wrong'}`}>
            <div className="ct">{chosen.label}</div>
            <div className="cs">{chosen.outcome}</div>
          </div>
          {!chosen.safe && (() => {
            const safe = c.options.find((o) => o.safe)!;
            return (
              <div className="choice correct" style={{ opacity: 0.9 }}>
                <div className="ct">Safer: {safe.label}</div>
                <div className="cs">{safe.outcome}</div>
              </div>
            );
          })()}
          <button className="btn ghost" type="button" style={{ marginTop: 10 }} onClick={advance}>
            {index === params.cases.length - 1
              ? L('done', 'See how you did')
              : L('next', 'Next situation')}
          </button>
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {chosen
          ? (chosen.safe ? 'Safe choice. ' : 'Risky choice. ') + chosen.outcome
          : `${c.situation} ${c.detail}`}
      </p>
    </div>
  );
}
