'use client';

import { useState } from 'react';
import { inr } from '@/lib/money';
import type { MechanicProps } from '@/content/types';
import type { GoalPlannerParams } from '@/content/experiences/j10-planning';

/** Engagement bar (MechanicProps): a goal has been picked — it already
 *  carries a real amount and a real date, satisfying the bar in one tap. */
export default function GoalPlanner({
  params, onExplored,
}: MechanicProps & { params: GoalPlannerParams }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = params.goals.find((g) => g.id === selectedId);

  const pick = (id: string) => {
    setSelectedId(id);
    onExplored();
  };

  const monthly = selected ? selected.amount / selected.months : 0;
  const weekly = monthly / 4.33;

  return (
    <div>
      {params.goals.map((g) => (
        <button
          key={g.id}
          type="button"
          className={`choice${selectedId === g.id ? ' sel' : ''}`}
          onClick={() => pick(g.id)}
        >
          <div className="ct">{g.label}</div>
          <div className="cs">{inr(g.amount)} · {g.months} months away</div>
        </button>
      ))}

      {selected && (
        <div className="readout">
          <div className="readline">
            <span>{inr(selected.amount)} ÷ {selected.months} months</span>
          </div>
          <div className="readline hero">
            <span>You need to save</span>
            <b>{inr(monthly)}/month</b>
          </div>
          <div className="readline">
            <span>That's about</span>
            <b>{inr(weekly)}/week</b>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {selected
          ? `${selected.label}: ${inr(selected.amount)} over ${selected.months} months means saving ${inr(monthly)} a month.`
          : 'Pick a goal to see the monthly saving it needs.'}
      </p>
    </div>
  );
}
