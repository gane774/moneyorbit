'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inr } from '@/lib/money';
import { STATEMENT, OPENING_BALANCE, runningBalance, summarise, type Txn } from '@/lib/sim/statement';

/**
 * Bank statement explorer (Section 30). A fictional month, readable line by
 * line. The skill being practised is noticing what recurs and what quietly
 * charges you -- so the reveal is opt-in: you get a chance to spot the charges
 * yourself before the tool points at them.
 */
export default function StatementTool() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [filter, setFilter] = useState<'all' | Txn['category']>('all');

  const s = summarise(STATEMENT);
  const balances = runningBalance(STATEMENT);
  const rows = STATEMENT.map((t, i) => ({ t, bal: balances[i] }))
    .filter(({ t }) => filter === 'all' || t.category === filter);

  const FILTERS: ('all' | Txn['category'])[] = ['all', 'essential', 'want', 'fee', 'transfer'];

  return (
    <main className="sheet">
      <button className="backLink" onClick={() => router.push('/lab')}>← Money Lab</button>

      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Tools · fictional statement</div>
      <h1 className="h-mid" style={{ marginBottom: 8 }}>Bank statement explorer</h1>
      <p className="body-s" style={{ marginTop: 0, marginBottom: 16 }}>
        One invented month. Read it before you tap reveal — see how many charges
        you would have noticed on your own.
      </p>

      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="readline"><span>Opening</span><b>{inr(OPENING_BALANCE)}</b></div>
        <div className="readline"><span>In</span><b>{inr(s.moneyIn)}</b></div>
        <div className="readline"><span>Out</span><b>{inr(s.moneyOut)}</b></div>
        <div className="readline hero"><span>Closing</span><b>{inr(s.closing)}</b></div>
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '18px 0 12px' }}>
        {FILTERS.map((f) => (
          <button key={f} className="chip" aria-pressed={f === filter}
            onClick={() => setFilter(f)}
            style={{
              border: `1px solid ${f === filter ? 'var(--ink)' : 'var(--ink-12)'}`,
              background: f === filter ? 'var(--ink)' : 'var(--paper)',
              color: f === filter ? 'var(--paper)' : 'var(--ink-60)',
            }}>
            {f === 'all' ? 'Everything' : f}
          </button>
        ))}
      </div>

      <div>
        {rows.map(({ t, bal }, i) => (
          <div className="alloc-row" key={`${t.day}-${t.desc}-${i}`}>
            <div className="al">
              <span className="at">
                {t.desc}
                {revealed && t.sneaky && (
                  <span className="ae" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                    easy to miss
                  </span>
                )}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ink-60)' }}>Day {t.day} · balance {inr(bal)}</span>
            </div>
            <span className="av" style={{ color: t.amount > 0 ? 'var(--good)' : undefined }}>
              {t.amount > 0 ? '+' : '−'}{inr(Math.abs(t.amount))}
            </span>
          </div>
        ))}
      </div>

      {!revealed ? (
        <button className="btn" style={{ marginTop: 18 }} onClick={() => setRevealed(true)}>
          Show what is easy to miss
        </button>
      ) : (
        <div className="verdict" style={{ marginTop: 18 }}>
          <div className="vt">
            {s.sneakyCount} charges worth {inr(s.sneakyTotal)} that are easy to scroll past
          </div>
          <div className="vb" style={{ marginBottom: 8 }}>
            Auto-renewals, a fee for using the wrong ATM, and a late charge. None
            of them announce themselves — they just sit between the groceries.
          </div>
          {s.recurring.length > 0 && (
            <div className="vb">
              <b>Repeats this month:</b>{' '}
              {s.recurring.map((r) => `${r.desc} ×${r.times} (${inr(r.total)})`).join(' · ')}
            </div>
          )}
        </div>
      )}

      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--ink-60)', fontStyle: 'italic', lineHeight: 1.5 }}>
        Entirely fictional. No real bank, account or person.
      </p>
    </main>
  );
}
