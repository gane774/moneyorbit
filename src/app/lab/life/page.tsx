'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inr } from '@/lib/money';
import {
  STARTING_STATE, EVENTS, ESSENTIALS_MONTHLY,
  advanceMonth, netWorth, summarise,
  type SimState,
} from '@/lib/sim/lifeSim';

/**
 * Financial Life Simulator (Section 31). Fictional throughout -- no real money,
 * no real products, and it never tells a student what to invest in.
 *
 * It reports outcomes rather than scoring them. Ending richer having borrowed
 * four times is not presented as a better run than ending poorer having never
 * borrowed, because it is not one.
 */
export default function LifeSim() {
  const router = useRouter();
  const [state, setState] = useState<SimState>(STARTING_STATE);
  const [step, setStep] = useState(0);
  const done = step >= EVENTS.length;
  const event = EVENTS[step];

  const choose = (idx: number) => {
    const after = event.choices[idx].apply(state);
    setState(advanceMonth(after));
    setStep(step + 1);
  };

  const restart = () => { setState(STARTING_STATE); setStep(0); };

  return (
    <main className="sheet">
      <button
        onClick={() => router.push('/lab')}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--ink-60)', fontSize: 13, marginBottom: 14 }}
      >
        ← Money Lab
      </button>

      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Life simulator · fictional</div>
      <h1 className="h-mid" style={{ marginBottom: 14 }}>
        {done ? summarise(state).headline : `Age ${state.age} · month ${state.month}`}
      </h1>

      <div className="readout" style={{ borderTop: 'none', paddingTop: 0, marginBottom: 20 }}>
        <div className="readline"><span>In hand</span><b>{inr(state.cash)}</b></div>
        <div className="readline"><span>Set aside</span><b>{inr(state.savings)}</b></div>
        <div className="readline">
          <span>Owed</span>
          <b style={{ color: state.debt > 0 ? 'var(--danger)' : undefined }}>{inr(state.debt)}</b>
        </div>
        <div className="readline"><span>Income / essentials</span><b>{inr(state.incomeMonthly)} / {inr(ESSENTIALS_MONTHLY)}</b></div>
      </div>

      {!done ? (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, marginBottom: 6 }}>
            {event.title}
          </h2>
          <p className="body-s" style={{ marginTop: 0, marginBottom: 16 }}>{event.body}</p>

          {event.choices.map((c, i) => (
            <button key={c.id} className="choice" onClick={() => choose(i)}>
              <div className="ct">{c.label}</div>
              <div className="cs">{c.detail}</div>
            </button>
          ))}
        </>
      ) : (
        <>
          <div className="verdict" style={{ marginBottom: 16 }}>
            <div className="vt">How the run went</div>
            {summarise(state).points.map((p) => (
              <div className="vb" key={p} style={{ marginBottom: 4 }}>{p}</div>
            ))}
          </div>

          <p className="body-s" style={{ marginTop: 0 }}>
            There is no winning score here. A run that ends with more money but
            three forced loans is not better than one that ends with less and none —
            which is the whole reason this shows what happened rather than ranking you.
          </p>

          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-60)' }}>
              What happened, month by month
            </summary>
            <ul style={{ marginTop: 10, paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: 'var(--ink-60)' }}>
              {state.log.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </details>

          <div className="spacer" />
          <button className="btn" onClick={restart}>Run it again, choose differently</button>
        </>
      )}
    </main>
  );
}
