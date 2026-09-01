'use client';

import { useState } from 'react';
import { inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { BankingParams } from '@/content/experiences/j05-banking';

/**
 * Journey 5 — banking, in three shapes.
 *
 * Follow a deposit for a year (12-14), match customers to the right account
 * type (15-16), compare three banks whose trade-offs genuinely conflict
 * (17-18). Interest is kept qualitative throughout: the compounding maths
 * already lives in Journey 7 and repeating it here would be duplication.
 */
export default function BankChoice({ params, labels, onExplored }: MechanicProps & { params: BankingParams }) {
  const L = (k: string, f: string) => labels?.[k] ?? f;

  if (params.mode === 'deposit-flow') return <DepositFlow params={params} labels={labels} onExplored={onExplored} />;
  if (params.mode === 'account-match') return <AccountMatch params={params} labels={labels} onExplored={onExplored} />;

  return <BankCompare params={params} labels={labels} onExplored={onExplored} />;
}

/* ---------------- 12-14 ---------------- */
function DepositFlow({ params, labels, onExplored }: MechanicProps & { params: BankingParams }) {
  const L = (k: string, f: string) => labels?.[k] ?? f;
  const d = params.deposit!;
  const [step, setStep] = useState(0);
  const interest = Math.round(d.amount * (d.ratePct / 100));

  const steps = [
    { label: L('deposit', 'He deposits'), value: inr(d.amount),
      note: 'Aarav hands over ₹5,000. The bank owes it back whenever he asks.' },
    { label: L('working', 'The bank puts deposits to work'), value: '—',
      note: 'It uses deposits from many customers to offer loans and services, and earns money doing that.' },
    { label: L('interest', 'Interest paid to Aarav'), value: `+${inr(interest)}`,
      note: `For letting his money sit there, the bank pays him ${d.ratePct}% over the year.` },
    { label: L('after', 'After one year'), value: inr(d.amount + interest),
      note: `The box under the bed still holds exactly ${inr(d.amount)}.` },
  ];

  const advance = () => {
    const next = step + 1;
    setStep(next);
    if (next >= steps.length - 1) onExplored();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }} aria-hidden="true">
        {steps.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i <= step ? 'var(--indigo)' : 'var(--ink-12)',
          }} />
        ))}
      </div>

      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: i < step ? '1px solid var(--ink-12)' : 'none' }}>
            <div className="readline" style={{ padding: 0 }}>
              <span>{s.label}</span>
              <b style={{ color: i === 2 ? 'var(--good)' : undefined }}>{s.value}</b>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-60)', marginTop: 3 }}>{s.note}</div>
          </div>
        ))}
      </div>

      <button className="btn ghost" style={{ marginTop: 14 }} disabled={step >= steps.length - 1} onClick={advance}>
        {step >= steps.length - 1 ? L('box', 'The box would still hold ₹5,000') : 'Next'}
      </button>
      <p className="sr-only" aria-live="polite">{steps[step].label}. {steps[step].note}</p>
    </div>
  );
}

/* ---------------- 15-16 ---------------- */
function AccountMatch({ params, labels, onExplored }: MechanicProps & { params: BankingParams }) {
  const L = (k: string, f: string) => labels?.[k] ?? f;
  const people = params.people ?? [];
  const [answers, setAnswers] = useState<Record<string, 'savings' | 'current'>>({});
  const [checked, setChecked] = useState(false);

  const allDone = people.every((p) => answers[p.id]);
  const correct = people.filter((p) => answers[p.id] === p.answer).length;

  return (
    <div>
      {people.map((p) => {
        const a = answers[p.id];
        const right = checked && a === p.answer;
        const wrong = checked && a && a !== p.answer;
        return (
          <div key={p.id} className={`choice${right ? ' correct' : ''}${wrong ? ' wrong' : ''}`} style={{ cursor: 'default' }}>
            <div className="ct">{p.label}</div>
            <div className="cs" style={{ marginBottom: 10 }}>{p.detail}</div>
            {!checked ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {(['savings', 'current'] as const).map((opt) => (
                  <button key={opt} type="button" className="btn ghost"
                    style={{ flex: 1, padding: '9px 0', background: a === opt ? 'var(--ink)' : undefined, color: a === opt ? 'var(--paper)' : undefined }}
                    onClick={() => setAnswers({ ...answers, [p.id]: opt })}>
                    {opt === 'savings' ? L('savings', 'Savings') : L('current', 'Current')}
                  </button>
                ))}
              </div>
            ) : (
              <div className="cs">
                <b>{p.answer === 'savings' ? 'Savings account' : 'Current account'}.</b> {p.why}
              </div>
            )}
          </div>
        );
      })}

      {!checked ? (
        <button className="btn ghost" style={{ marginTop: 12 }} disabled={!allDone}
          onClick={() => { setChecked(true); onExplored(); }}>
          {allDone ? L('check', 'Check my answers') : 'Answer all four first'}
        </button>
      ) : (
        <div className="readout">
          <div className="readline hero"><span>Correct</span><b>{correct} of {people.length}</b></div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {checked ? `${correct} of ${people.length} correct.` : 'Choose an account type for each customer.'}
      </p>
    </div>
  );
}

/* ---------------- 17-18 ---------------- */
function BankCompare({ params, labels, onExplored }: MechanicProps & { params: BankingParams }) {
  const L = (k: string, f: string) => labels?.[k] ?? f;
  const banks = params.banks ?? [];
  const [opened, setOpened] = useState<Set<string>>(new Set());

  const open = (id: string) => {
    const next = new Set(opened);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpened(next);
    if (next.size >= banks.length) onExplored();
  };

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--ink-12)' }}>
      <span style={{ color: 'var(--ink-60)' }}>{k}</span>
      <span style={{ textAlign: 'right' }}>{v}</span>
    </div>
  );

  return (
    <div>
      {banks.map((b) => (
        <button key={b.id} type="button" className={`choice${opened.has(b.id) ? ' sel' : ''}`} onClick={() => open(b.id)}>
          <div className="ct">{b.name}</div>
          <div className="cs">{b.interest} · {b.minBalance}</div>
          {opened.has(b.id) && (
            <div style={{ marginTop: 10 }}>
              <Row k={L('interest', 'Interest')} v={b.interest} />
              <Row k={L('minBalance', 'Minimum balance')} v={b.minBalance} />
              <Row k={L('branches', 'Branches')} v={b.branches} />
              <Row k={L('digital', 'App')} v={b.digital} />
              <Row k={L('fees', 'Fees')} v={b.fees} />
              <div style={{ marginTop: 8, fontSize: 12.5 }}>
                <b>{L('bestFor', 'Suits')}:</b> {b.bestFor}
              </div>
              <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--ink-60)' }}>{b.tradeoff}</div>
            </div>
          )}
        </button>
      ))}
      <p className="sr-only" aria-live="polite">
        {opened.size >= banks.length ? 'All three banks compared.' : 'Open each bank to compare.'}
      </p>
    </div>
  );
}
