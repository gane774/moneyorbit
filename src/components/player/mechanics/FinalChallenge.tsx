'use client';

import { useState } from 'react';
import { inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import {
  LIFE, LINES, STEP, FINE_STEP, FINE_LINES, BONUS, BONUS_CHOICES,
  takeHome, totalDeductions, totalCommitments, allocatable,
  totalAllocated, sumGroup, carRepair, judgeBonus, rentRise, buildReport,
  type Alloc, type EventOutcome, type Report,
} from '@/lib/sim/finalChallenge';

type Stage = 'payslip' | 'allocate' | 'repair' | 'bonus' | 'rent' | 'report';

/**
 * The final challenge (items 1-8 of the content brief).
 *
 * Runs as a sequence of stages inside the normal Interact slot, so navigation,
 * progress and the player shell all keep working unchanged. Engagement is
 * signalled once the report is reached.
 *
 * Steps are ₹10,000 by default. At an allocatable pool of ₹90,000 that is nine
 * taps to place everything, which is the point -- the brief explicitly rules
 * out making someone click two hundred times at a salary this size.
 */
export default function FinalChallenge({ onExplored }: MechanicProps) {
  const [stage, setStage] = useState<Stage>('payslip');
  const [alloc, setAlloc] = useState<Alloc>({});
  const [bonusChoice, setBonusChoice] = useState<string | null>(null);

  const [repair, setRepair] = useState<EventOutcome | null>(null);
  const [bonus, setBonus] = useState<EventOutcome | null>(null);
  const [rent, setRent] = useState<EventOutcome | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  const pool = allocatable();
  const placed = totalAllocated(alloc);
  const left = pool - placed;

  const stepFor = (id: string) => (FINE_LINES.has(id) ? FINE_STEP : STEP);

  const bump = (id: string, dir: 1 | -1) =>
    setAlloc((prev) => {
      const spent = LINES.reduce((s, l) => s + (prev[l.id] ?? 0), 0);
      const room = pool - spent;
      const st = stepFor(id);
      const cur = prev[id] ?? 0;
      const next = dir === 1 ? cur + Math.min(st, room) : Math.max(0, cur - st);
      return { ...prev, [id]: next };
    });

  /* Events run off the allocation, so the same choices always produce the
     same year -- a student who re-runs it is testing their plan, not luck. */
  const runRepair = () => {
    const r = carRepair(alloc.emergency ?? 0, 3);
    setRepair(r);
    setStage('repair');
  };

  const runBonus = (choice: string) => {
    const fundNow = (alloc.emergency ?? 0) * 8 + (repair?.emergencyDelta ?? 0);
    const debtNow = repair?.debtDelta ?? 0;
    const essentials = totalCommitments() + sumGroup(alloc, 'living');
    const b = judgeBonus(choice, debtNow, Math.max(0, fundNow), essentials);
    setBonusChoice(choice);
    setBonus(b);
  };

  const runRent = () => {
    const r = rentRise(alloc);
    setRent(r);
    setStage('rent');
  };

  const finish = () => {
    const fund = Math.max(0,
      (alloc.emergency ?? 0) * 12 + (repair?.emergencyDelta ?? 0) + (bonus?.emergencyDelta ?? 0) + (rent?.emergencyDelta ?? 0));
    const debt = Math.max(0, (repair?.debtDelta ?? 0) + (bonus?.debtDelta ?? 0));
    setReport(buildReport(alloc, {
      debt, emergencyFund: fund,
      bonusHandledWell: bonus?.handledWell ?? false,
      rentHandledWell: rent?.handledWell ?? false,
      repairHandledWell: repair?.handledWell ?? false,
    }));
    setStage('report');
    onExplored();
  };

  /* ---------------- payslip ---------------- */
  if (stage === 'payslip') {
    return (
      <div>
        <div className="goalCard">
          <div className="goalKicker">Your life</div>
          <div className="goalName">{LIFE.age}, {LIFE.city}</div>
          <div className="goalAsk">
            A home loan with 18 years left, parents you send money to every month,
            and nothing set aside behind you.
          </div>
        </div>

        <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="readline"><span>Salary on paper</span><b>{inr(LIFE.grossMonthly)}</b></div>
          {LIFE.deductions.map((d) => (
            <div className="readline" key={d.label} style={{ color: 'var(--ink-60)' }}>
              <span>− {d.label}{d.note && <span className="ae" style={{ marginLeft: 6 }}>{d.note}</span>}</span>
              <b>−{inr(d.amount)}</b>
            </div>
          ))}
          <div className="readline hero" style={{ borderTop: '1px solid var(--ink-12)', paddingTop: 8 }}>
            <span>Actually reaches you</span><b>{inr(takeHome())}</b>
          </div>
        </div>

        <div className="readout">
          <div style={{ fontSize: 12.5, color: 'var(--ink-60)', marginBottom: 6 }}>
            Already committed before you decide anything:
          </div>
          {LIFE.commitments.map((c) => (
            <div className="readline" key={c.id}>
              <span>{c.label}{c.note && <span className="ae" style={{ marginLeft: 6 }}>{c.note}</span>}</span>
              <b>−{inr(c.amount)}</b>
            </div>
          ))}
          <div className="readline hero" style={{ borderTop: '1px solid var(--ink-12)', paddingTop: 8 }}>
            <span>Yours to decide</span><b>{inr(pool)}</b>
          </div>
        </div>

        <p className="body-s" style={{ marginTop: 14 }}>
          {inr(LIFE.grossMonthly)} on paper became <b>{inr(pool)}</b> you actually
          control. That gap is the first thing most people get wrong about a salary.
        </p>

        <button className="btn" style={{ marginTop: 14 }} onClick={() => setStage('allocate')}>
          Split the {inr(pool)}
        </button>
      </div>
    );
  }

  /* ---------------- allocate ---------------- */
  if (stage === 'allocate') {
    const groups: { key: 'living' | 'lifestyle' | 'future'; label: string }[] = [
      { key: 'living', label: 'Living costs' },
      { key: 'lifestyle', label: 'Lifestyle' },
      { key: 'future', label: 'Your future' },
    ];
    return (
      <div>
        <div className="alloc-hero">
          <span>Left to place</span>
          <b className={left === 0 ? 'done' : ''}>{inr(left)}</b>
        </div>
        <div className="stackbar" aria-hidden="true">
          <div style={{ width: `${(sumGroup(alloc, 'living') / pool) * 100}%`, background: 'var(--indigo)' }} />
          <div style={{ width: `${(sumGroup(alloc, 'lifestyle') / pool) * 100}%`, background: 'var(--n200)' }} />
          <div style={{ width: `${(sumGroup(alloc, 'future') / pool) * 100}%`, background: 'var(--good)' }} />
          <div style={{ flex: 1, background: 'var(--ink-12)' }} />
        </div>

        {groups.map((g) => (
          <div key={g.key}>
            <div className="sectionLabel" style={{ margin: '18px 0 4px' }}>{g.label}</div>
            {LINES.filter((l) => l.group === g.key).map((l) => (
              <div className="alloc-row" key={l.id}>
                <div className="al">
                  <span className="at">{l.label}</span>
                  {l.hint && <span className="ae">{l.hint}</span>}
                </div>
                <div className="stepper">
                  <button type="button" aria-label={`Decrease ${l.label}`}
                    disabled={(alloc[l.id] ?? 0) === 0} onClick={() => bump(l.id, -1)}>−</button>
                  <span className="av">{inr(alloc[l.id] ?? 0)}</span>
                  <button type="button" aria-label={`Increase ${l.label}`}
                    disabled={left <= 0} onClick={() => bump(l.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        ))}

        <button className="btn" style={{ marginTop: 18 }} disabled={left !== 0} onClick={runRepair}>
          {left === 0 ? 'Start the year' : `Place the remaining ${inr(left)}`}
        </button>
      </div>
    );
  }

  /* ---------------- events ---------------- */
  const EventCard = ({ month, title, body, outcome, onNext, nextLabel }: {
    month: string; title: string; body: string; outcome: EventOutcome | null;
    onNext: () => void; nextLabel: string;
  }) => (
    <div>
      <div className="goalCard">
        <div className="goalKicker">{month}</div>
        <div className="goalName" style={{ fontSize: 'clamp(18px,4.2vw,23px)' }}>{title}</div>
        <div className="goalAsk">{body}</div>
      </div>
      {outcome && (
        <div className={`verdict${outcome.handledWell ? ' good' : ''}`}>
          <div className="vt">{outcome.headline}</div>
          <div className="vb">{outcome.detail}</div>
        </div>
      )}
      <button className="btn" style={{ marginTop: 16 }} onClick={onNext}>{nextLabel}</button>
    </div>
  );

  if (stage === 'repair') {
    return <EventCard
      month="Month 3" title="Your car needs an unexpected repair."
      body="₹35,000, and you need the car to get to work. This is not optional."
      outcome={repair} onNext={() => setStage('bonus')} nextLabel="Keep going" />;
  }

  if (stage === 'bonus') {
    return (
      <div>
        <div className="goalCard">
          <div className="goalKicker">Month 8</div>
          <div className="goalName" style={{ fontSize: 'clamp(18px,4.2vw,23px)' }}>
            A bonus lands: {inr(BONUS)}.
          </div>
          <div className="goalAsk">What do you do with it?</div>
        </div>

        {!bonus ? (
          BONUS_CHOICES.map((c) => (
            <button key={c.id} className="choice" onClick={() => runBonus(c.id)}>
              <div className="ct">{c.label}</div>
              <div className="cs">{c.detail}</div>
            </button>
          ))
        ) : (
          <>
            <div className={`verdict${bonus.handledWell ? ' good' : ''}`}>
              <div className="vt">{bonus.headline}</div>
              <div className="vb">{bonus.detail}</div>
            </div>
            <button className="btn" style={{ marginTop: 16 }} onClick={runRent}>Keep going</button>
          </>
        )}
      </div>
    );
  }

  if (stage === 'rent') {
    return <EventCard
      month="Month 12" title="Your rent goes up ₹5,000 a month."
      body="Not a disaster on its own. Whether it hurts depends on the room you left yourself."
      outcome={rent} onNext={finish} nextLabel="See my financial health" />;
  }

  /* ---------------- report ---------------- */
  if (stage === 'report' && report) {
    return (
      <div>
        <div className="sectionLabel" style={{ marginTop: 0 }}>Your financial health</div>
        {report.dimensions.map((d) => (
          <div key={d.key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600 }}>{d.icon} {d.label}</span>
              <b style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{d.score}<span style={{ color: 'var(--ink-35)' }}>/100</span></b>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--ink-12)', margin: '7px 0 6px', overflow: 'hidden' }}>
              <div style={{
                width: `${d.score}%`, height: '100%',
                background: d.score >= 70 ? 'var(--good)' : d.score >= 40 ? 'var(--n200)' : 'var(--danger)',
              }} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.45 }}>{d.note}</div>
          </div>
        ))}

        <div className="verdict good" style={{ marginTop: 18 }}>
          <div className="vt">Your strongest decision</div>
          <div className="vb">{report.strongest.icon} {report.strongest.label} — {report.strongest.note}</div>
        </div>
        <div className="verdict" style={{ marginTop: 10 }}>
          <div className="vt">Your biggest weakness</div>
          <div className="vb">{report.weakest.icon} {report.weakest.label} — {report.weakest.note}</div>
        </div>
        <div className="verdict" style={{ marginTop: 10, background: 'rgba(39,43,99,.07)', borderColor: 'rgba(39,43,99,.25)' }}>
          <div className="vt" style={{ color: 'var(--indigo)' }}>The one thing to change</div>
          <div className="vb">{report.oneChange}</div>
        </div>

        <p className="body-s" style={{ marginTop: 16 }}>
          There is no pass mark here. Two people can run this well and end up with
          very different numbers — what matters is whether the trade-offs were ones
          you chose rather than ones that happened to you.
        </p>
      </div>
    );
  }

  return null;
}
