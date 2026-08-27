'use client';

import { rich } from '@/lib/rich';

export function TopBar({
  journeyName,
  progressPct,
  onBack,
}: {
  journeyName: string;
  progressPct: number;
  onBack?: () => void;
}) {
  return (
    <div className="topbar">
      <button className="back" onClick={onBack} aria-label="Go back" disabled={!onBack}>
        ‹
      </button>
      <div className="jname">{journeyName}</div>
      <div
        className="pbar"
        role="progressbar"
        aria-valuenow={Math.round(progressPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress through this experience"
      >
        <i style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}

export function Kicker({ children }: { children: string }) {
  return <div className="kicker">{rich(children, 'k')}</div>;
}

/** Placeholder copy is rendered visibly flagged so it can never ship unnoticed. */
export function PlaceholderBadge() {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9.5,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: 'var(--danger)',
        border: '1px dashed var(--danger)',
        borderRadius: 6,
        padding: '4px 8px',
        marginBottom: 12,
        alignSelf: 'flex-start',
      }}
    >
      Placeholder content
    </div>
  );
}
