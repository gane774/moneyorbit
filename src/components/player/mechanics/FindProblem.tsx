'use client';

import { useMemo, useState } from 'react';
import { inr } from '@/lib/money';
import { shuffle } from '@/lib/shuffle';
import type { MechanicProps } from '@/content/types';
import type { FindProblemParams } from '@/content/experiences/j03-budgeting';

/**
 * Diagnose someone else's budget.
 *
 * Replaces allocate-events, which asked a student to build a good budget
 * before anything had shown them what one looks like -- so the plan was
 * marked against a standard they had no way to know.
 *
 * Deliberately multi-select with plausible non-problems in the list: the
 * skill is deciding which lines are actually the issue, and a set where
 * everything is wrong teaches nothing about that.
 *
 * Engagement bar (MechanicProps): answers checked once.
 */
export default function FindProblem({
  params, labels, onExplored,
}: MechanicProps & { params: FindProblemParams }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const flaws = useMemo(() => shuffle(params.flaws), [params.flaws]);
  const L = (k: string, fallback: string) => labels?.[k] ?? fallback;

  const toggle = (id: string) => {
    if (checked) return;
    const next = new Set(picked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setPicked(next);
  };

  const check = () => { setChecked(true); onExplored(); };

  const realProblems = params.flaws.filter((f) => f.isProblem);
  const found = realProblems.filter((f) => picked.has(f.id)).length;
  const falseFlags = params.flaws.filter((f) => !f.isProblem && picked.has(f.id)).length;

  const cls = (f: { id: string; isProblem: boolean }) => {
    if (!checked) return picked.has(f.id) ? 'choice sel' : 'choice';
    if (f.isProblem) return 'choice correct';
    return picked.has(f.id) ? 'choice wrong' : 'choice';
  };

  return (
    <div>
      <div className="goalCard">
        <div className="goalKicker">{L('income', 'Income')}</div>
        <div className="goalName">{inr(params.income)}<span style={{ fontSize: 14, fontWeight: 400 }}> a month</span></div>
        <div className="goalAsk">
          <b>{L('goal', 'What they want')}:</b> {params.goal}
        </div>
      </div>

      <div className="readout" style={{ borderTop: 'none', paddingTop: 0, marginBottom: 16 }}>
        {params.lines.map((l) => (
          <div className="readline" key={l.label}>
            <span>
              {l.label}
              {l.note && <span className="ae" style={{ marginLeft: 7 }}>{l.note}</span>}
            </span>
            <b>{inr(l.amount)}</b>
          </div>
        ))}
        <div className="readline" style={{ borderTop: '1px solid var(--ink-12)', marginTop: 4, paddingTop: 8 }}>
          <span>Left unassigned</span>
          <b style={{ color: params.leftover === 0 ? 'var(--danger)' : undefined }}>{inr(params.leftover)}</b>
        </div>
      </div>

      <div role="group" aria-label="Which lines are a problem?">
        {flaws.map((f) => (
          <button key={f.id} type="button" className={cls(f)}
            aria-pressed={picked.has(f.id)} onClick={() => toggle(f.id)}>
            <div className="ct">{f.label}</div>
            {checked && <div className="cs">{f.why}</div>}
          </button>
        ))}
      </div>

      {!checked ? (
        <button className="btn ghost" type="button" style={{ marginTop: 12 }}
          disabled={picked.size === 0} onClick={check}>
          {picked.size === 0 ? 'Pick at least one' : L('check', 'Check my answers')}
        </button>
      ) : (
        <div className="readout">
          <div className="readline hero">
            <span>Real problems spotted</span>
            <b>{found} of {realProblems.length}</b>
          </div>
          {falseFlags > 0 && (
            <div className="readline">
              <span>Flagged but defensible</span>
              <b>{falseFlags}</b>
            </div>
          )}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {checked
          ? `You found ${found} of ${realProblems.length} real problems.`
          : 'Select the budget lines you think are a problem, then check.'}
      </p>
    </div>
  );
}
