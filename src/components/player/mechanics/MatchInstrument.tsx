'use client';

import { useMemo, useState } from 'react';
import { inr, compound } from '@/lib/money';
import { shuffle } from '@/lib/shuffle';
import type { MechanicProps } from '@/content/types';
import type { InvestmentParams } from '@/content/experiences/j04-investments';

/**
 * Journey 4 — what the thing actually is.
 *
 * Three modes for three bands: a single ownership stake made concrete (12-14),
 * sorting six instruments into what you actually hold (15-16), and the cost of
 * an expense ratio compounded over twenty years (17-18).
 *
 * Nothing here touches risk or time horizon — those belong to J8 and J9, and
 * keeping this journey to "what am I buying" is what stops the three
 * overlapping.
 */
export default function MatchInstrument({ params, labels, onExplored }: MechanicProps & { params: InvestmentParams }) {
  const L = (k: string, f: string) => labels?.[k] ?? f;

  /* ---------------- 12-14: your 1% of a real business ---------------- */
  const [month, setMonth] = useState<'good' | 'bad' | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  if (params.mode === 'ownership') {
    const c = params.company!;
    const show = (m: 'good' | 'bad') => {
      setMonth(m);
      const next = new Set(seen); next.add(m); setSeen(next);
      if (next.size === 2) onExplored();
    };
    const value = month ? (month === 'good' ? c.goodMonth : c.badMonth) * (c.sharePct / 100) : null;

    return (
      <div>
        <div className="goalCard">
          <div className="goalKicker">You own {c.sharePct}% of</div>
          <div className="goalName">{c.name}</div>
          <div className="goalAsk">You put in {inr(c.stake)}. Now the shop has a month.</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className={`choice${month === 'good' ? ' sel' : ''}`} style={{ flex: 1 }}
            onClick={() => show('good')}>
            <div className="ct">{L('good', 'A good month')}</div>
            <div className="cs">The shop is worth {inr(c.goodMonth)}</div>
          </button>
          <button type="button" className={`choice${month === 'bad' ? ' sel' : ''}`} style={{ flex: 1 }}
            onClick={() => show('bad')}>
            <div className="ct">{L('bad', 'A bad month')}</div>
            <div className="cs">The shop is worth {inr(c.badMonth)}</div>
          </button>
        </div>

        {value !== null && (
          <div className="readout">
            <div className="readline hero">
              <span>{L('yours', 'Your 1% is worth')}</span>
              <b style={{ color: month === 'good' ? 'var(--good)' : 'var(--danger)' }}>{inr(value)}</b>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-60)', marginTop: 4 }}>
              You put in {inr(c.stake)}. Your slice moves with the shop — that is what owning means.
            </div>
          </div>
        )}

        {seen.size === 2 && (
          <div className="verdict good" style={{ marginTop: 14 }}>
            <div className="vt">{L('pooled', 'What if you did not pick the shop yourself?')}</div>
            <div className="vb">
              Instead of owning one shop, your money could join a pool that buys pieces of
              many shops at once. One shop having a bad month would barely move it.
            </div>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {seen.size === 2 ? 'Both months seen.' : 'Try a good month and a bad month.'}
        </p>
      </div>
    );
  }

  /* ---------------- 15-16: sort six instruments ---------------- */
  if (params.mode === 'match') {
    return <MatchMode params={params} labels={labels} onExplored={onExplored} />;
  }

  /* ---------------- 17-18: what the fee costs ---------------- */
  const cmp = params.compare!;
  const [ran, setRan] = useState(false);
  const results = cmp.funds.map((f) => ({
    ...f,
    net: cmp.grossReturn - f.expenseRatio,
    ends: compound(cmp.principal, cmp.grossReturn - f.expenseRatio, cmp.years),
  }));
  const gap = Math.round(Math.max(...results.map(r => r.ends))) - Math.round(Math.min(...results.map(r => r.ends)));

  return (
    <div>
      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="readline"><span>You invest</span><b>{inr(cmp.principal)}</b></div>
        <div className="readline"><span>Both funds return</span><b>{cmp.grossReturn}% a year before fees</b></div>
        <div className="readline"><span>Left for</span><b>{cmp.years} years</b></div>
      </div>

      {!ran ? (
        <button className="btn ghost" style={{ marginTop: 14 }} onClick={() => { setRan(true); onExplored(); }}>
          Run the comparison
        </button>
      ) : (
        <>
          {results.map((r) => (
            <div key={r.label} className="readout">
              <div className="readline">
                <span>{r.label} <span className="ae" style={{ marginLeft: 6 }}>{r.kind}</span></span>
                <b>−{r.expenseRatio}%</b>
              </div>
              <div className="readline"><span>{L('net', 'Return after fees')}</span><b>{r.net.toFixed(1)}%</b></div>
              <div className="readline hero"><span>{L('ends', 'Ends with')}</span><b>{inr(r.ends)}</b></div>
            </div>
          ))}
          <div className="verdict" style={{ marginTop: 12 }}>
            <div className="vt">{L('gap', 'Difference')}: {inr(gap)}</div>
            <div className="vb">
              Same holdings, same market, same {cmp.years} years. The only difference was the
              annual fee — and it cost {inr(gap)} on an initial {inr(cmp.principal)}.
            </div>
          </div>
        </>
      )}
      <p className="sr-only" aria-live="polite">
        {ran ? `The fee difference cost ${inr(gap)} over ${cmp.years} years.` : 'Run the comparison.'}
      </p>
    </div>
  );
}

/* Split out so the hooks above are never called conditionally. */
function MatchMode({ params, labels, onExplored }: MechanicProps & { params: InvestmentParams }) {
  const L = (k: string, f: string) => labels?.[k] ?? f;
  const cats = params.categories ?? [];
  const items = params.instruments ?? [];
  const order = useMemo(() => shuffle(items), [items]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const assign = (catId: string) => {
    if (!active || checked) return;
    setAnswers({ ...answers, [active]: catId });
    setActive(null);
  };

  const allDone = order.every((i) => answers[i.id]);
  const correctCount = order.filter((i) => answers[i.id] === i.category).length;

  return (
    <div>
      {!checked && (
        <p className="body-s" style={{ marginTop: 0 }}>
          Tap an instrument, then tap where it belongs.
        </p>
      )}

      <div style={{ marginBottom: 14 }}>
        {order.map((i) => {
          const a = answers[i.id];
          const right = checked && a === i.category;
          const wrong = checked && a && a !== i.category;
          return (
            <button key={i.id} type="button"
              className={`choice${active === i.id ? ' sel' : ''}${right ? ' correct' : ''}${wrong ? ' wrong' : ''}`}
              onClick={() => !checked && setActive(active === i.id ? null : i.id)}
              disabled={checked}>
              <div className="ct">{i.label}</div>
              {a && !checked && (
                <div className="cs">→ {cats.find((c) => c.id === a)?.label}</div>
              )}
              {checked && (
                <div className="cs">
                  {right ? '' : `Actually: ${cats.find((c) => c.id === i.category)?.label}. `}{i.line}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!checked && (
        <>
          <div className="sectionLabel" style={{ marginTop: 0 }}>
            {active ? 'Where does it belong?' : 'Categories'}
          </div>
          {cats.map((c) => (
            <button key={c.id} type="button" className="choice"
              onClick={() => assign(c.id)} disabled={!active}
              style={{ opacity: active ? 1 : 0.55 }}>
              <div className="ct">{c.label}</div>
              <div className="cs">{c.hint}</div>
            </button>
          ))}
          <button className="btn ghost" style={{ marginTop: 12 }} disabled={!allDone}
            onClick={() => { setChecked(true); onExplored(); }}>
            {allDone ? L('check', 'Check my answers') : 'Match every instrument first'}
          </button>
        </>
      )}

      {checked && (
        <div className="readout">
          <div className="readline hero"><span>Correct</span><b>{correctCount} of {order.length}</b></div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {checked ? `${correctCount} of ${order.length} correct.` : 'Match each instrument to what you actually hold.'}
      </p>
    </div>
  );
}
