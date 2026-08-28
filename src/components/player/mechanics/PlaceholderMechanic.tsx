'use client';

import type { MechanicType } from '@/content/types';

/** Stands in until each mechanic is built. Keeps the 11-journey flow
 *  walkable end to end, and never pretends to be finished content. */
/* No onExplored prop: InteractScreen decides "explored" from real pointer,
   key and input events on its wrapper, so this button unlocks the CTA the
   same way a slider does. A prop here would be dead code implying a
   contract that does not exist. */
export default function PlaceholderMechanic({
  mechanicType,
  note,
}: {
  mechanicType: MechanicType;
  note: string;
}) {
  return (
    <div
      style={{
        border: '1px dashed var(--ink-12)',
        borderRadius: 12,
        padding: 18,
        background: 'rgba(21,24,15,.02)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-35)',
          marginBottom: 10,
        }}
      >
        Mechanic · {mechanicType}
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-60)' }}>{note}</p>
      <button className="btn ghost" style={{ marginTop: 16 }} type="button">
        Simulate interaction
      </button>
    </div>
  );
}
