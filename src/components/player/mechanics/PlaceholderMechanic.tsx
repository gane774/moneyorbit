'use client';

import type { MechanicProps, MechanicType } from '@/content/types';

/** Stands in until each mechanic is built. Keeps the 11-journey flow
 *  walkable end to end, and never pretends to be finished content. */
/**
 * Stands in until each mechanic is built.
 *
 * Must be impossible to mistake for a finished screen, including when it
 * sits directly beside authored copy — which is now the normal case, since
 * an experience can have real copy for one age band and none for another.
 * So it states what it is in words rather than paraphrasing the headline.
 *
 * Engagement bar: the explicit acknowledgement button. There is no real
 * interaction to gate on yet.
 */
export default function PlaceholderMechanic({
  mechanicType,
  onExplored,
}: MechanicProps & { mechanicType: MechanicType }) {
  return (
    <div
      style={{
        border: '1px dashed var(--danger)',
        borderRadius: 12,
        padding: 18,
        background: 'rgba(178,58,46,.05)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--danger)',
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        [Placeholder — pending content]
      </div>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.5,
          color: 'var(--ink-60)',
        }}
      >
        The <b>{mechanicType}</b> mechanic has not been built. Nothing on this
        panel is finished content.
      </p>
      <button
        className="btn ghost"
        style={{ marginTop: 16 }}
        type="button"
        onClick={onExplored}
      >
        Skip the interaction
      </button>
    </div>
  );
}
