'use client';

import { useState } from 'react';
import type { MechanicProps } from '@/content/types';
import type { SpotScamParams } from '@/content/experiences/j11-scams';

type Judgment = { offerId: string; saidScam: boolean };

/** Engagement bar (MechanicProps): every offer has been judged — right or
 *  wrong doesn't matter, only that all four calls were made. No timer, per
 *  author decision — the script never asked for one. */
export default function SpotScam({
  params, labels, onExplored,
}: MechanicProps & { params: SpotScamParams }) {
  const [judged, setJudged] = useState<Judgment[]>([]);

  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;

  const judge = (offerId: string, saidScam: boolean) => {
    if (judged.find((j) => j.offerId === offerId)) return;
    const next = [...judged, { offerId, saidScam }];
    setJudged(next);
    if (next.length === params.offers.length) onExplored();
  };

  return (
    <div>
      {params.offers.map((o) => {
        const verdict = judged.find((j) => j.offerId === o.id);
        const correct = verdict ? verdict.saidScam === o.isScam : null;
        return (
          <div
            key={o.id}
            className={`choice${verdict ? (correct ? ' correct' : ' wrong') : ''}`}
            style={{ cursor: 'default' }}
          >
            <div className="cs" style={{ fontStyle: 'italic', marginBottom: 10 }}>“{o.message}”</div>
            {!verdict ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn ghost" type="button" style={{ flex: 1, padding: '9px 0' }} onClick={() => judge(o.id, false)}>
                  {L('legit', 'Legit')}
                </button>
                <button className="btn ghost" type="button" style={{ flex: 1, padding: '9px 0' }} onClick={() => judge(o.id, true)}>
                  {L('scam', 'Scam')}
                </button>
              </div>
            ) : (
              <div className="ct" style={{ fontSize: 13 }}>
                {correct ? '✓ ' : '✗ '}
                You said {verdict.saidScam ? 'Scam' : 'Legit'}. {o.redFlag}
              </div>
            )}
          </div>
        );
      })}

      <p className="sr-only" aria-live="polite">
        {judged.length} of {params.offers.length} messages judged.
      </p>
    </div>
  );
}
