'use client';

import { useMemo, useState } from 'react';
import { inr } from '@/lib/money';
import { shuffle } from '@/lib/shuffle';
import type { MechanicProps } from '@/content/types';
import type { MatchGoalParams } from '@/content/experiences/j09-destinations';

type Answer = { goalId: string; instrumentId: string; correct: boolean };

/**
 * Tap-to-match, not literal drag-and-drop — same pedagogy (goal to
 * instrument), far more reliable on a touchscreen. One goal is active at a
 * time; tapping an instrument locks that pair permanently and shows why it
 * was right or wrong immediately, then advances.
 *
 * Engagement bar (MechanicProps): every goal has been matched — right or
 * wrong doesn't matter, only that all five decisions were made.
 */
export default function MatchGoal({
  params, onExplored,
}: MechanicProps & { params: MatchGoalParams }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const goal = params.goals[index];

  /* Reshuffled for every goal. Fixed order let a student notice the correct
     instrument tended to sit in the same place and answer from position
     rather than from goal + horizon + liquidity. Keyed on `index` so it is
     stable while they are deciding and only changes when the goal does. */
  const shownInstruments = useMemo(
    () => shuffle(params.instruments),
    [params.instruments, index],
  );
  const answered = answers.find((a) => a.goalId === goal?.id);
  const finished = index >= params.goals.length;

  const pick = (instrumentId: string) => {
    if (answered) return;
    const correct = instrumentId === goal.correctInstrumentId;
    setAnswers([...answers, { goalId: goal.id, instrumentId, correct }]);
  };

  const advance = () => {
    const next = index + 1;
    setIndex(next);
    if (next >= params.goals.length) onExplored();
  };

  if (finished) {
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <div className="readout" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="readline hero">
          <span>Matched</span>
          <b>{correctCount} of {params.goals.length} correct</b>
        </div>
      </div>
    );
  }

  const correctInstrument = params.instruments.find((i) => i.id === goal.correctInstrumentId)!;
  const pickedInstrument = answered ? params.instruments.find((i) => i.id === answered.instrumentId)! : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }} aria-hidden="true">
        {params.goals.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 99,
              background: i < index ? 'var(--indigo)' : i === index ? 'var(--ink-35)' : 'var(--ink-12)',
            }}
          />
        ))}
      </div>

      {/* The scenario is the screen, not a caption on it: a student should
          understand what the money is for and how soon it is needed before
          they even look at the options. */}
      <div className="goalCard">
        <div className="goalKicker">Your goal</div>
        <div className="goalName">{goal.goalLabel}</div>
        <div className="goalMeta">
          <span><b>{inr(goal.amount)}</b> needed</span>
          <span className="goalWhen">{goal.timeline}</span>
        </div>
        <div className="goalAsk">Where should this money sit until then?</div>
      </div>

      {!answered && shownInstruments.map((inst) => (
        <button key={inst.id} type="button" className="choice" onClick={() => pick(inst.id)}>
          <div className="ct">{inst.label}</div>
          <div className="cs">{inst.line}</div>
        </button>
      ))}

      {answered && (
        <>
          <div className={`choice ${answered.correct ? 'correct' : 'wrong'}`}>
            <div className="ct">{pickedInstrument!.label}</div>
            <div className="cs">
              {answered.correct
                ? goal.reasoning
                : `Not quite — ${correctInstrument.label} fits better. ${goal.reasoning}`}
            </div>
          </div>
          <button className="btn ghost" type="button" style={{ marginTop: 10 }} onClick={advance}>
            {index === params.goals.length - 1 ? 'See the full ladder' : 'Next goal'}
          </button>
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {answered
          ? (answered.correct ? 'Correct match.' : `Not the best fit. ${correctInstrument.label} was the answer.`)
          : `Where does ${goal.goalLabel} belong?`}
      </p>
    </div>
  );
}
