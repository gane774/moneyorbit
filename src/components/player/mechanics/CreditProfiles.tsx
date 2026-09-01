'use client';

import { useMemo, useState } from 'react';
import { shuffle } from '@/lib/shuffle';
import type { MechanicProps } from '@/content/types';
import type { CreditProfileParams } from '@/content/experiences/j02-credit-score';

/**
 * Journey 2 — predict, then reveal.
 *
 * The prediction has to come first: reading two records and being told the
 * answer teaches far less than committing to one and finding out. Profiles are
 * shuffled so position carries no information.
 *
 * Bands resolve to a qualitative range, never an invented point score — CIBIL
 * publishes no formula and pretending otherwise would be teaching a fiction.
 *
 * Engagement bar: a prediction made and revealed.
 */
export default function CreditProfiles({ params, labels, onExplored }: MechanicProps & { params: CreditProfileParams }) {
  const [picked, setPicked] = useState<string | null>(null);
  const L = (k: string, f: string) => labels?.[k] ?? f;
  const order = useMemo(() => shuffle(params.profiles), [params.profiles]);

  const choose = (id: string) => {
    if (picked) return;
    setPicked(id);
    onExplored();
  };

  const bandColor = (b: string) =>
    b === 'Excellent' ? 'var(--good)' : b === 'Good' ? 'var(--n200)' : b === 'Fair' ? 'var(--n10)' : 'var(--danger)';

  return (
    <div>
      <div className="goalCard">
        <div className="goalKicker">{L('predict', 'Your prediction')}</div>
        <div className="goalName" style={{ fontSize: 'clamp(17px,4vw,21px)' }}>{params.question}</div>
      </div>

      {order.map((p) => {
        const revealed = Boolean(picked);
        const isFavoured = p.id === params.favouredId;
        const isPicked = picked === p.id;
        const cls = !revealed
          ? (isPicked ? 'choice sel' : 'choice')
          : isFavoured ? 'choice correct' : (isPicked ? 'choice wrong' : 'choice');

        return (
          <button key={p.id} type="button" className={cls}
            onClick={() => choose(p.id)} disabled={revealed}>
            <div className="ct">{p.name}</div>
            <div className="cs">{p.summary}</div>

            {revealed && (
              <>
                <div style={{ marginTop: 10 }}>
                  {p.factors.map((f) => (
                    <div key={f.label} style={{
                      display: 'flex', justifyContent: 'space-between', gap: 10,
                      fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--ink-12)',
                    }}>
                      <span style={{ color: 'var(--ink-60)' }}>{f.label}</span>
                      <span style={{ color: f.good ? 'var(--good)' : 'var(--danger)', textAlign: 'right' }}>
                        {f.detail}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginTop: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em',
                    textTransform: 'uppercase', color: bandColor(p.band), fontWeight: 600,
                  }}>{p.band}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-35)' }}>{p.range}</span>
                </div>
                <div className="cs" style={{ marginTop: 6 }}>{p.verdict}</div>
              </>
            )}
          </button>
        );
      })}

      <p className="sr-only" aria-live="polite">
        {picked ? 'Records revealed for every profile.' : 'Choose who you think a lender would prefer.'}
      </p>
    </div>
  );
}
