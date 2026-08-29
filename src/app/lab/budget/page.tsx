'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inr } from '@/lib/money';
import { DEFAULT_LINES, summariseBudget, type BudgetLine } from '@/lib/sim/budget';

/**
 * Budget simulator (Section 30). Journey 3 fixes the numbers to make one
 * point; here you bring your own and the tool just reports what they mean.
 */
export default function BudgetTool() {
  const router = useRouter();
  const [income, setIncome] = useState(35_000);
  const [lines, setLines] = useState<BudgetLine[]>(DEFAULT_LINES);

  const s = summariseBudget(income, lines);
  const step = income <= 5_000 ? 100 : income <= 50_000 ? 500 : 2_000;

  /* Functional update, not `lines.map(...)`. The plain form reads `lines` from
     the render closure, so several taps landing before the next render all
     apply to the same stale value and every one after the first is lost.
     Steppers get tapped fast, so that is a real dropped-input bug, not a
     theoretical one. */
  const bump = (id: string, dir: 1 | -1) =>
    setLines((prev) => prev.map((l) => l.id === id
      ? { ...l, amount: Math.max(0, l.amount + dir * step) }
      : l));

  const bucketColor = { needs: 'var(--indigo)', wants: 'var(--n200)', savings: 'var(--good)' } as const;

  return (
    <main className="sheet">
      <button className="backLink" onClick={() => router.push('/lab')}>← Money Lab</button>

      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Tools · your own numbers</div>
      <h1 className="h-mid" style={{ marginBottom: 8 }}>Budget simulator</h1>
      <p className="body-s" style={{ marginTop: 0, marginBottom: 18 }}>
        Put in what you actually get, then give every rupee a job.
      </p>

      <div className="ctrl">
        <div className="lab">
          <label htmlFor="inc">Money in each month</label><b>{inr(income)}</b>
        </div>
        <input id="inc" type="range" min={500} max={150_000} step={500}
          value={income} onChange={(e) => setIncome(+e.target.value)}
          aria-valuetext={inr(income)} />
      </div>

      <div className="alloc-hero">
        <span>{s.overspent ? 'Over by' : 'Left to allocate'}</span>
        <b className={s.remaining === 0 ? 'done' : ''}
           style={s.overspent ? { color: 'var(--danger)' } : undefined}>
          {inr(Math.abs(s.remaining))}
        </b>
      </div>

      <div className="stackbar" aria-hidden="true">
        {(['needs', 'wants', 'savings'] as const).map((b) => (
          <div key={b} style={{
            width: `${Math.min(100, income > 0 ? (s.byBucket[b] / income) * 100 : 0)}%`,
            background: bucketColor[b], transition: 'width .2s ease',
          }} />
        ))}
        <div style={{ flex: 1, background: 'var(--ink-12)' }} />
      </div>
      <div className="legend" style={{ marginTop: 8 }}>
        <span><i style={{ background: bucketColor.needs }} />Needs {s.sharePct.needs}%</span>
        <span><i style={{ background: bucketColor.wants }} />Wants {s.sharePct.wants}%</span>
        <span><i style={{ background: bucketColor.savings }} />Set aside {s.sharePct.savings}%</span>
      </div>

      <div style={{ marginTop: 14 }}>
        {lines.map((l) => (
          <div className="alloc-row" key={l.id}>
            <div className="al">
              <span className="at">{l.label}</span>
              <span className="ae">{l.bucket}</span>
            </div>
            <div className="stepper">
              <button type="button" aria-label={`Decrease ${l.label}`}
                disabled={l.amount === 0} onClick={() => bump(l.id, -1)}>−</button>
              <span className="av">{inr(l.amount)}</span>
              <button type="button" aria-label={`Increase ${l.label}`}
                onClick={() => bump(l.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="readout">
        <div className="readline"><span>If income stopped, this covers</span>
          <b>{s.runwayMonths >= 0.1 ? `${s.runwayMonths.toFixed(1)} months` : '—'}</b></div>
      </div>

      {s.notes.length > 0 && (
        <div className="verdict" style={{ marginTop: 14 }}>
          <div className="vt">What this plan means</div>
          {s.notes.map((n) => <div className="vb" key={n} style={{ marginBottom: 4 }}>{n}</div>)}
        </div>
      )}

      <button className="btn ghost" style={{ marginTop: 16 }}
        onClick={() => setLines(DEFAULT_LINES)}>Reset</button>

      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--ink-60)', fontStyle: 'italic', lineHeight: 1.5 }}>
        Nothing here is saved or sent anywhere — it stays in this browser tab.
      </p>
    </main>
  );
}
